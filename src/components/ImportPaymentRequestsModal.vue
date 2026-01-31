<template>
  <div
    class="modal is-active"
    aria-modal="true"
    aria-labelledby="import-payment-requests-title"
  >
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p
          id="import-payment-requests-title"
          class="modal-card-title is-title-shrink"
        >
          {{ $gettext("Import payment requests") }}
        </p>
        <button
          class="delete"
          :aria-label="$gettext('Close')"
          @click="$modal.close()"
        ></button>
      </header>

      <section class="modal-card-body">
        <div class="body-content">
          <p class="modal-intro">
            {{
              $gettext(
                "Upload a CSV file to create multiple payment requests at once."
              )
            }}
          </p>

          <section class="csv-format-info" aria-labelledby="csv-format-title">
            <h2
              id="csv-format-title"
              class="section-title has-text-weight-semibold"
            >
              {{ $gettext("CSV file format") }}
            </h2>
            <p class="section-description">
              {{
                $gettext(
                  "The file must contain 2 columns, the first row must contain the column names."
                )
              }}
            </p>

            <dl class="format-list">
              <div class="format-row">
                <dt><code>related_wallet</code></dt>
                <dd>
                  <p>{{ $gettext("The other party's wallet address") }}</p>
                  <p class="format-example">
                    <span>{{ $gettext("Example") }}:</span>
                    <code>0x1234abcd...</code>
                  </p>
                </dd>
              </div>
              <div class="format-row">
                <dt><code>amount</code></dt>
                <dd>
                  <p>{{ $gettext("Payment request amount") }}</p>
                  <p class="format-example">
                    <span>{{ $gettext("Example") }}:</span>
                    <code>50.00</code> / <code>-30.00</code>
                  </p>
                </dd>
              </div>
            </dl>

            <div class="format-note">
              <p class="has-text-weight-semibold">
                {{ $gettext("Before importing") }}
              </p>
              <ul>
                <li>
                  {{
                    $gettext("The 0x prefix in wallet addresses is optional.")
                  }}
                </li>
                <li>
                  {{
                    $gettext(
                      "Positive amounts are incoming payments; negative amounts are outgoing payments."
                    )
                  }}
                </li>
              </ul>
            </div>
          </section>

          <div
            v-if="parsedRequests.length > 0 && !submissionError"
            class="
              notification
              is-success is-light
              import-status
              has-file-remove
            "
          >
            <span class="icon"><fa-icon icon="check-circle" /></span>
            <div class="status-copy">
              <p class="has-text-weight-semibold">
                {{ $gettext("File validated successfully") }}
              </p>
              <p class="selected-file-name">{{ selectedFileName }}</p>
              <p>{{ readyRequestsMessage }}</p>
            </div>
            <button
              type="button"
              class="delete file-remove"
              :aria-label="$gettext('Remove file')"
              @click="resetFileSelection"
              :disabled="isCreating"
            ></button>
          </div>

          <div
            v-else-if="validationError || submissionError"
            class="notification is-danger is-light import-status"
            :class="{ 'has-file-remove': validationError }"
          >
            <span class="icon"><fa-icon icon="times-circle" /></span>
            <div class="status-copy">
              <p class="has-text-weight-semibold">
                {{
                  submissionError
                    ? $gettext("Failed to create payment requests")
                    : $gettext("The file could not be imported")
                }}
              </p>
              <p v-if="selectedFileName" class="selected-file-name">
                {{ selectedFileName }}
              </p>
              <p>{{ submissionError || validationError }}</p>
            </div>

            <button
              v-if="validationError"
              type="button"
              class="delete file-remove"
              :aria-label="$gettext('Remove file')"
              @click="resetFileSelection"
              :disabled="isCreating || isReading"
            ></button>
          </div>

          <div v-else class="file is-light is-boxed is-file-picker">
            <label class="file-label">
              <input
                class="file-input"
                type="file"
                name="payment-requests-file"
                accept=".csv"
                @change="handleFileSelect"
                :disabled="isReading"
              />
              <span class="file-cta">
                <span class="file-icon">
                  <fa-icon icon="cloud-arrow-up" />
                </span>
                <span class="file-label">{{ $gettext("Import file") }}</span>
              </span>
            </label>
          </div>
        </div>
      </section>

      <footer
        class="
          modal-card-foot
          custom-modal-card-foot
          is-justify-content-flex-end
        "
      >
        <button
          type="button"
          class="button custom-button-modal has-text-weight-medium"
          @click="createPaymentRequests"
          :disabled="parsedRequests.length === 0 || isCreating"
        >
          <span class="icon"><fa-icon icon="plus-circle" /></span>
          <span>
            {{
              isCreating
                ? $gettext("Creating...")
                : $gettext("Create payment requests")
            }}
          </span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "@/exception"
  import { getUserAccount } from "@/utils/account"
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
        validationError: "",
        submissionError: "",
        parsedRequests: [] as ParsedRequest[],
        selectedFileName: "",
        isCreating: false,
        isReading: false,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      this.account = getUserAccount(opts.account)
    },
    computed: {
      readyRequestsMessage() {
        const count = this.parsedRequests.length
        return this.$ngettext(
          "%{ count } payment request is ready to be created.",
          "%{ count } payment requests are ready to be created.",
          count,
          { count }
        )
      },
    },
    methods: {
      resetFileSelection() {
        this.selectedFileName = ""
        this.validationError = ""
        this.submissionError = ""
        this.parsedRequests = []
      },

      async handleFileSelect(event: Event) {
        if (this.isReading) return

        const input = event.target as HTMLInputElement
        const file = input.files?.[0]

        if (!file) return

        input.value = ""

        this.isReading = true
        this.selectedFileName = file.name
        this.validationError = ""
        this.submissionError = ""
        this.parsedRequests = []

        try {
          const content = await file.text()
          this.validateAndParseCSV(content)
        } catch (err: any) {
          this.validationError =
            err.message || this.$gettext("Failed to read file")
        } finally {
          this.isReading = false
        }
      },

      validateAndParseCSV(content: string) {
        this.validationError = ""
        this.submissionError = ""
        this.parsedRequests = []

        const lines = content.trim().split(/\r?\n/)

        if (lines.length < 2) {
          this.validationError = this.$gettext(
            "The file must contain a header row and at least one data row."
          )
          return
        }

        const headerLine = lines[0].toLowerCase()
        const delimiter = headerLine.includes(";") ? ";" : ","
        const headers = this.parseCSVLine(headerLine, delimiter)
        const expectedHeaders = ["related_wallet", "amount"]
        const hasValidHeaders =
          headers.length === expectedHeaders.length &&
          expectedHeaders.every(
            (expectedHeader, index) => headers[index]?.trim() === expectedHeader
          )

        if (!hasValidHeaders) {
          this.validationError = this.$gettext(
            "Invalid columns. Expected: %{ expected }. Found: %{ actual }.",
            {
              expected: expectedHeaders.join(", "),
              actual: headers.join(", "),
            }
          )
          return
        }

        const selfWalletUri: string = this.account.internalId
        const requests: ParsedRequest[] = []

        for (let index = 1; index < lines.length; index++) {
          const line = lines[index].trim()
          if (!line) continue

          const values = this.parseCSVLine(line, delimiter)
          const rowNumber = index + 1

          if (values.length !== 2) {
            this.validationError = this.$gettext(
              "Row %{ row }: expected 2 columns, found %{ count }.",
              {
                row: rowNumber,
                count: values.length,
              }
            )
            return
          }

          const relatedWallet = values[0].trim()
          const amountText = values[1].trim()

          if (!relatedWallet) {
            this.validationError = this.$gettext(
              "Row %{ row }: related_wallet is empty.",
              { row: rowNumber }
            )
            return
          }

          const amount = Number(amountText.replace(",", "."))
          if (!Number.isFinite(amount) || amount === 0) {
            this.validationError = this.$gettext(
              'Row %{ row }: "%{ amount }" is not a valid non-zero amount.',
              {
                row: rowNumber,
                amount: amountText,
              }
            )
            return
          }

          const cleanRelatedWallet = relatedWallet
            .toLowerCase()
            .replace(/^0x/, "")
          const relatedWalletUri = `comchain:${cleanRelatedWallet}`
          const isIncoming = amount > 0

          requests.push({
            sender_wallet_uri: isIncoming ? relatedWalletUri : selfWalletUri,
            receiver_wallet_uri: isIncoming ? selfWalletUri : relatedWalletUri,
            amount: Math.abs(amount),
          })
        }

        this.parsedRequests = requests
      },

      parseCSVLine(line: string, delimiter: string): string[] {
        const result: string[] = []
        let current = ""
        let inQuotes = false

        for (let index = 0; index < line.length; index++) {
          const char = line[index]

          if (char === '"' && inQuotes && line[index + 1] === '"') {
            current += '"'
            index++
          } else if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === delimiter && !inQuotes) {
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
          this.submissionError = ""

          try {
            await this.account.createPaymentRequest(this.parsedRequests)

            const count = this.parsedRequests.length
            this.$msg.success(
              this.$ngettext(
                "%{ count } payment request was created successfully.",
                "%{ count } payment requests were created successfully.",
                count,
                { count }
              )
            )

            const { refreshTransaction, refreshAccounts } =
              this.$modal.args.value[0]
            if (refreshTransaction) refreshTransaction()
            if (refreshAccounts) refreshAccounts()

            this.$modal.close()
          } catch (err: any) {
            this.submissionError =
              err.message || this.$gettext("Failed to create payment requests")
            throw new UIError(
              this.$gettext(
                "Failed to create payment requests. Please check the error and try again."
              ),
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
  @import "@/assets/custom-variables";

  .body-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-intro,
  .section-title,
  .section-description,
  .format-row p,
  .format-note p,
  .status-copy p {
    margin: 0;
  }

  .modal-intro {
    font-size: 1rem;
    line-height: 1.45;
  }

  .csv-format-info {
    padding: 1rem;
    border-radius: 8px;
    background: $inner-card-background-color;
  }

  .section-title {
    font-size: 1rem;
    line-height: 1.25;
  }

  .section-description {
    margin-top: 0.25rem;
    color: #6b6b6b;
    font-size: 0.875rem;
  }

  .format-list {
    margin-top: 0.75rem;
  }

  .format-row {
    display: grid;
    grid-template-columns: minmax(0, 8.25rem) minmax(0, 1fr);
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-top: 1px solid rgba(0, 0, 0, 0.08);

    dt,
    dd {
      min-width: 0;
    }

    dd {
      font-size: 0.875rem;
      line-height: 1.4;
    }

    code {
      padding: 0.15em 0.4em;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.07);
      overflow-wrap: anywhere;
    }

    dt code {
      white-space: nowrap;
    }
  }

  .format-row .format-example {
    margin-top: 0.3rem;
    color: #6b6b6b;
    font-size: 0.8rem;

    span {
      margin-right: 0.25rem;
    }
  }

  .format-note {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    color: #6b6b6b;
    font-size: 0.8rem;
    line-height: 1.4;

    ul {
      margin: 0.35rem 0 0 1.1rem;
      list-style: disc;
    }

    li + li {
      margin-top: 0.2rem;
    }
  }

  .import-status {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0.6rem;
    margin: 0;
    padding: 0.8rem;
    font-size: 0.875rem;
    line-height: 1.4;

    &.has-file-remove {
      padding-right: 2.5rem;
    }

    > .icon {
      margin-top: 0.1rem;
    }

    .file-remove {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }
  }

  .file.is-file-picker {
    justify-content: center;
    width: 100%;

    .file-cta,
    .file-label:hover .file-cta {
      color: $modal-btn-background-color !important;
      border-color: $modal-btn-border-color !important;
      background-color: whitesmoke;
    }
  }

  .status-copy {
    min-width: 0;
  }

  .selected-file-name {
    overflow-wrap: anywhere;
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .modal-card-foot {
    gap: 0.5rem;
    flex-wrap: nowrap;

    .button {
      padding-right: 1.25rem;
      padding-left: 1.25rem;
    }
  }

  @media screen and (max-width: 480px) {
    .format-row {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.35rem;
    }

    .modal-card-foot .button {
      flex: 1 1 0;
      min-width: 0;
      height: auto;
      min-height: 2.25em;
      white-space: normal;
    }
  }
</style>
