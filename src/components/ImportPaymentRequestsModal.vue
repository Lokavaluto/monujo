<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          {{ $gettext("Import payment requests") }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$modal.close()"
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="content">
          <p>{{ $gettext("Upload a CSV file to create multiple payment requests at once.") }}</p>
          
          <div class="csv-format-info box">
            <h4 class="is-size-6 has-text-weight-bold mb-2">
              {{ $gettext("CSV file format") }}
            </h4>
            <p class="is-size-7 mb-2">{{ $gettext("The file must contain 3 columns:") }}</p>
            <table class="table is-narrow is-size-7">
              <thead>
                <tr>
                  <th>{{ $gettext("Column") }}</th>
                  <th>{{ $gettext("Description") }}</th>
                  <th>{{ $gettext("Example") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>sender_wallet</code></td>
                  <td>{{ $gettext("Sender wallet address") }}</td>
                  <td><code>0x1234abcd...</code></td>
                </tr>
                <tr>
                  <td><code>receiver_wallet</code></td>
                  <td>{{ $gettext("Receiver wallet address") }}</td>
                  <td><code>0x5678efgh...</code></td>
                </tr>
                <tr>
                  <td><code>amount</code></td>
                  <td>{{ $gettext("Amount to request") }}</td>
                  <td><code>50.00</code></td>
                </tr>
              </tbody>
            </table>
            <p class="is-size-7 has-text-grey">
              {{ $gettext("Note: First row should be the header row. The 0x prefix is optional.") }}
            </p>
          </div>

          <div v-if="validationStatus === 'validated'" class="notification is-success is-light">
            <span class="icon"><fa-icon icon="check-circle" /></span>
            {{ $gettext("File validated successfully!") }} 
            {{ parsedRequests.length }} {{ $gettext("payment requests ready to create.") }}
          </div>

          <div v-if="validationStatus === 'error'" class="notification is-danger is-light">
            <span class="icon"><fa-icon icon="times-circle" /></span>
            {{ validationError }}
          </div>
        </div>
      </section>
      <footer class="modal-card-foot custom-modal-card-foot is-justify-content-space-between">
        <div class="file-upload-container">
          <input
            type="file"
            ref="fileInput"
            accept=".csv"
            @change="handleFileSelect"
            class="file-input-hidden"
          />
          <button
            class="button custom-button-modal has-text-weight-medium"
            @click="triggerFileInput"
            :disabled="isCreating"
          >
            <span class="icon"><fa-icon icon="file-alt" /></span>
            <span>{{ $gettext("Import requests data") }}</span>
          </button>
        </div>
        <button
          v-if="validationStatus === 'validated'"
          class="button custom-button-modal has-text-weight-medium is-success"
          @click="createPaymentRequests"
          :disabled="isCreating"
        >
          <span class="icon"><fa-icon icon="plus-circle" /></span>
          <span>{{ isCreating ? $gettext("Creating...") : $gettext("Create payment requests") }}</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "@/exception"
  import applyDecorators from "@/utils/applyDecorators"
  import { showSpinnerMethod } from "@/utils/showSpinner"

  interface ParsedRequest {
    sender_wallet_uri: string
    receiver_wallet_uri: string
    amount: number
  }

  @Options({
    name: "ImportPaymentRequestsModal",
    data() {
      return {
        validationStatus: "idle" as "idle" | "validated" | "error",
        validationError: "",
        parsedRequests: [] as ParsedRequest[],
        isCreating: false,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      let { account } = opts
      if (account._obj?.getTransactions) {
        account = account._obj
      } else {
        account = account._obj.parent
      }
      this.account = account
    },
    methods: {
      triggerFileInput() {
        (this.$refs.fileInput as HTMLInputElement).click()
      },

      handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement
        if (!input.files || input.files.length === 0) return

        const file = input.files[0]
        this.parseCSVFile(file)
      },

      parseCSVFile(file: File) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            this.validateAndParseCSV(content)
          } catch (err: any) {
            this.validationStatus = "error"
            this.validationError = err.message || "Failed to read file"
          }
        }
        reader.onerror = () => {
          this.validationStatus = "error"
          this.validationError = "Failed to read file"
        }
        reader.readAsText(file)
      },

      validateAndParseCSV(content: string) {
        this.validationStatus = "idle"
        this.validationError = ""
        this.parsedRequests = []

        const lines = content.trim().split(/\r?\n/)
        
        if (lines.length < 2) {
          this.validationStatus = "error"
          this.validationError = "File must contain at least a header row and one data row"
          return
        }

        const headerLine = lines[0].toLowerCase()
        const headers = this.parseCSVLine(headerLine)
        
        const expectedHeaders = ["sender_wallet", "receiver_wallet", "amount"]
        const hasValidHeaders = expectedHeaders.every((h, i) => 
          headers[i]?.trim() === h
        )

        if (!hasValidHeaders) {
          this.validationStatus = "error"
          this.validationError = `Invalid headers. Expected: ${expectedHeaders.join(", ")}. Got: ${headers.join(", ")}`
          return
        }

        const requests: ParsedRequest[] = []
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const values = this.parseCSVLine(line)
          
          if (values.length < 3) {
            this.validationStatus = "error"
            this.validationError = `Row ${i + 1}: Expected 3 columns, got ${values.length}`
            return
          }

          const senderWallet = values[0]?.trim()
          const receiverWallet = values[1]?.trim()
          const amountStr = values[2]?.trim()

          if (!senderWallet) {
            this.validationStatus = "error"
            this.validationError = `Row ${i + 1}: sender_wallet is empty`
            return
          }

          if (!receiverWallet) {
            this.validationStatus = "error"
            this.validationError = `Row ${i + 1}: receiver_wallet is empty`
            return
          }

          const amount = parseFloat(amountStr)
          if (isNaN(amount) || amount <= 0) {
            this.validationStatus = "error"
            this.validationError = `Row ${i + 1}: Invalid amount "${amountStr}". Must be a positive number`
            return
          }

          const cleanSenderWallet = senderWallet.toLowerCase().replace(/^0x/, "")
          const cleanReceiverWallet = receiverWallet.toLowerCase().replace(/^0x/, "")

          requests.push({
            sender_wallet_uri: `comchain:${cleanSenderWallet}`,
            receiver_wallet_uri: `comchain:${cleanReceiverWallet}`,
            amount: amount,
          })
        }

        if (requests.length === 0) {
          this.validationStatus = "error"
          this.validationError = "No valid data rows found in the file"
          return
        }

        this.parsedRequests = requests
        this.validationStatus = "validated"
        this.$msg.success(this.$gettext("File validated successfully"))
      },

      parseCSVLine(line: string): string[] {
        const result: string[] = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            inQuotes = !inQuotes
          } else if ((char === "," || char === ";") && !inQuotes) {
            result.push(current)
            current = ""
          } else {
            current += char
          }
        }
        result.push(current)
        
        return result
      },

      createPaymentRequests: applyDecorators(
        [showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<void> {
          if (this.isCreating) return
          this.isCreating = true

          try {
            await this.account.createPaymentRequest(this.parsedRequests)

            this.$msg.success(
              this.$gettext("%{ count } payment requests created successfully", {
                count: this.parsedRequests.length,
              })
            )

            const { refreshTransaction, refreshAccounts } = this.$modal.args.value[0]
            if (refreshTransaction) refreshTransaction()
            if (refreshAccounts) refreshAccounts()

            this.$modal.close()
          } catch (err: any) {
            this.validationStatus = "error"
            this.validationError = err.message || "Failed to create payment requests"
            throw new UIError(
              this.$gettext("Failed to create payment requests. Please check the error and try again."),
              err
            )
          } finally {
            this.isCreating = false
          }
        }
      ),
    },
  })
  export default class ImportPaymentRequestsModal extends Vue {}
</script>

<style lang="scss" scoped>
  .csv-format-info {
    background: #f5f5f5;
    
    table {
      width: 100%;
      
      code {
        background: #e8e8e8;
        padding: 0.1em 0.4em;
        border-radius: 3px;
        font-size: 0.85em;
      }
    }
  }

  .file-input-hidden {
    display: none;
  }

  .file-upload-container {
    display: flex;
    align-items: center;
  }

  .notification {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .icon {
      flex-shrink: 0;
    }
  }

  .modal-card-foot {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .button .icon {
    margin-right: 0.3em;
  }
</style>
