## Inspired from:
## https://raw.githubusercontent.com/fastlane/fastlane/master/fastlane/lib/fastlane/actions/set_github_release.rb


module Fastlane
  module Actions
    module SharedValues
      GITHUB_RELEASE_HTML_LINK = :GITHUB_RELEASE_HTML_LINK
      GITHUB_RELEASE_RELEASE_ID = :GITHUB_RELEASE_RELEASE_ID
    end

    class GithubReleaseAction < Action
      def self.run(params)

        repo_name = params[:repository_name]
        api_token = params[:api_token]
        api_bearer = params[:api_bearer]
        server_url = params[:server_url]
        tag_name = params[:tag_name]

        payload = {
          'tag_name' => params[:tag_name],
          'draft' => !!params[:is_draft],
          'prerelease' => !!params[:is_prerelease],
          'generate_release_notes' => !!params[:is_generate_release_notes]
        }
        payload['name'] = params[:name] if params[:name]
        payload['body'] = params[:description] if params[:description]
        payload['target_commitish'] = params[:commitish] if params[:commitish]

        json = self.get(repo_name, tag_name, server_url, api_token, api_bearer)
        if ! json
          UI.important("Creating release of #{params[:repository_name]} on tag \"#{params[:tag_name]}\" with name \"#{params[:name]}\".")
          result = GithubApiAction.run(
            server_url: server_url,
            api_token: api_token,
            api_bearer: api_bearer,
            http_method: 'POST',
            path: "repos/#{repo_name}/releases",
            body: payload,
            error_handlers: {
              422 => proc do |result|
                UI.error(result[:body])
                UI.error("Release on tag #{tag_name} already exists!")
                return nil
              end,
              404 => proc do |result|
                UI.error(result[:body])
                UI.user_error!("Repository #{repo_name} cannot be found, please double check its name and that you provided a valid API token (GITHUB_API_TOKEN or GITHUB_TOKEN)")
              end,
              401 => proc do |result|
                UI.error(result[:body])
                UI.user_error!("You are not authorized to access #{repo_name}, please make sure you provided a valid API token (GITHUB_API_TOKEN or GITHUB_TOKEN)")
              end,
              '*' => proc do |result|
                UI.user_error!("GitHub responded with #{result[:status]}:#{result[:body]}")
              end
            }
          )
          json = result[:json]
          body = result[:body]
          UI.success("Successfully created release at tag \"#{tag_name}\" on GitHub")
        else
          UI.important("Release of #{params[:repository_name]} on tag \"#{params[:tag_name]}\" already exists.")
          UI.message("  Current release draft status is #{json["draft"]}")
          if json["draft"] != payload["draft"]
            UI.important("    -> did you want it to be #{payload["draft"]} ?")
          end
          UI.message("  Current release prerelease status is #{json["prerelease"]}")
          if json["prerelease"] != payload["prerelease"]
            UI.important("    -> did you want it to be #{payload["prerelease"]} ?")
          end
        end
        html_url = json['html_url']
        release_id = json['id']

        UI.message("  URL: #{html_url}")

        Actions.lane_context[SharedValues::GITHUB_RELEASE_HTML_LINK] = html_url
        Actions.lane_context[SharedValues::GITHUB_RELEASE_RELEASE_ID] = release_id

        assets = params[:upload_assets]
        if assets && assets.count > 0
          # upload assets
          assets.each do |asset, label|
            existing = json['assets'].find { |e| e["label"] == label }
            if existing
              if ! params[:overwrite_existing_assets]
                UI.important("  Asset '#{label}' already exists.")
                UI.message("    (Ignoring, use 'overwrite_existing_assets:true' to overwrite)")
                next
              end
              GithubApiAction.run(
                server_url: server_url,
                api_token: api_token,
                api_bearer: api_bearer,
                http_method: 'DELETE',
                path: URI(existing["url"]).request_uri,
                error_handlers: {
                  '*' => proc do |get_result|
                    UI.error("GitHub responded with #{get_result[:status]}:#{get_result[:body]}")
                    UI.user_error!("Failed to delete existing asset '#{label}'.")
                  end
                }
              )
              UI.success("Successfully deleted previous version of assets '#{label}'")
            end
            self.upload(asset, label, json['upload_url'], api_token, api_bearer)
          end
          # fetch the release again, so that it contains the uploaded assets
          GithubApiAction.run(
            server_url: server_url,
            api_token: api_token,
            api_bearer: api_bearer,
            http_method: 'GET',
            path: "repos/#{repo_name}/releases/#{release_id}",
            error_handlers: {
              '*' => proc do |get_result|
                UI.error("GitHub responded with #{get_result[:status]}:#{get_result[:body]}")
                UI.user_error!("Failed to fetch the newly created release, but it *has been created* successfully.")
              end
            }
          ) do |get_result|
            UI.success("Successfully checked release \"#{params[:tag_name]}\"")
            return get_result[:json]
          end
        else
          return json || body
        end
      end

      def self.upload(asset_path, label, upload_url_template, api_token, api_bearer)
        # if it's a directory, zip it first in a temp directory, because we can only upload binary files
        absolute_path = File.absolute_path(asset_path)

        # check that the asset even exists
        UI.user_error!("Asset #{absolute_path} doesn't exist") unless File.exist?(absolute_path)

        if File.directory?(absolute_path)
          Dir.mktmpdir do |dir|
            tmpzip = File.join(dir, File.basename(absolute_path) + '.zip')
            sh("cd \"#{File.dirname(absolute_path)}\"; zip -r --symlinks \"#{tmpzip}\" \"#{File.basename(absolute_path)}\" 2>&1 >/dev/null")
            self.upload_file(tmpzip, label, upload_url_template, api_token, api_bearer)
          end
        else
          self.upload_file(absolute_path, label, upload_url_template, api_token, api_bearer)
        end
      end

      def self.upload_file(file, label, url_template, api_token, api_bearer)
        require 'addressable/template'
        file_name = File.basename(file)
        expanded_url = Addressable::Template.new(url_template).expand(name: file_name, label: label).to_s
        headers = { 'Content-Type' => 'application/zip' } # works for all binary files
        UI.important("Uploading #{file_name} -- \"#{label}\"")
        GithubApiAction.run(
          api_token: api_token,
          api_bearer: api_bearer,
          http_method: 'POST',
          headers: headers,
          url: expanded_url,
          raw_body: File.read(file),
          error_handlers: {
            422 => proc do |result|
              UI.error(result[:body])
              UI.error("Aset #{file_name} already exists !")
              return nil
            end,
            '*' => proc do |result|
              UI.error("GitHub responded with #{result[:status]}:#{result[:body]}")
              UI.user_error!("Failed to upload asset #{file_name} to GitHub.")
            end
          }
        ) do |result|
          UI.success("Successfully uploaded #{file_name}.")
        end
      end

      def self.get(url, version, server_url, api_token, api_bearer)
        GithubApiAction.run(
          server_url: server_url,
          api_token: api_token,
          api_bearer: api_bearer,
          http_method: 'GET',
          path: "repos/#{url}/releases",
          error_handlers: {
            404 => proc do |result|
              UI.error("Repository #{url} cannot be found, please double check its name and that you provided a valid API token (if it's a private repository).")
              return nil
            end,
            401 => proc do |result|
              UI.error("You are not authorized to access #{url}, please make sure you provided a valid API token.")
              return nil
            end,
            '*' => proc do |result|
              UI.error("GitHub responded with #{result[:status]}:#{result[:body]}")
              return nil
            end
          }
        ) do |result|
          json = result[:json]
          json.each do |current|
            next unless current['tag_name'] == version
            return current
          end
        end

        return nil
      end

      #####################################################
      # @!group Documentation
      #####################################################
      def self.description
        "This will create a new release on GitHub and upload assets for it"
      end

      def self.details
        [
          "Creates a new release on GitHub. You must provide your GitHub " +
          "Personal token (get one from " +
          "[https://github.com/settings/tokens/new](https://github.com/settings/tokens/new))"+
          ", the repository name and tag name. By default, that's `master`." +
          "If the tag doesn't exist, one will be created on the commit or " +
          "branch passed in as commitish.",
          "Out parameters provide the release's id, which can be used for " +
          "later editing and the release HTML link to GitHub. You can also " +
          "specify a list of assets to be uploaded to the release with the " +
          "`:upload_assets` parameter."
        ].join("\n")
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :repository_name,
                                       env_name: "FL_GITHUB_RELEASE_REPOSITORY_NAME",
                                       description: "The path to your repo, e.g. 'fastlane/fastlane'",
                                       verify_block: proc do |value|
                                         UI.user_error!("Please only pass the path, e.g. 'fastlane/fastlane'") if value.include?("github.com")
                                         UI.user_error!("Please only pass the path, e.g. 'fastlane/fastlane'") if value.split('/').count != 2
                                       end),
          FastlaneCore::ConfigItem.new(key: :server_url,
                                       env_name: "FL_GITHUB_RELEASE_SERVER_URL",
                                       description: "The server url. e.g. 'https://your.internal.github.host/api/v3' (default: 'https://api.github.com')",
                                       default_value: "https://api.github.com",
                                       optional: true,
                                       verify_block: proc do |value|
                                         UI.user_error!("Please include the protocol in the server url, e.g. https://your.github.server/api/v3") unless value.include?("//")
                                       end),
          FastlaneCore::ConfigItem.new(key: :api_token,
                                       env_name: "FL_GITHUB_RELEASE_API_TOKEN",
                                       description: "Personal API Token for GitHub - generate one at https://github.com/settings/tokens",
                                       conflicting_options: [:api_bearer],
                                       sensitive: true,
                                       code_gen_sensitive: true,
                                       default_value: ENV["GITHUB_API_TOKEN"],
                                       default_value_dynamic: true,
                                       optional: true),
          FastlaneCore::ConfigItem.new(key: :api_bearer,
                                       env_name: "FL_GITHUB_RELEASE_API_BEARER",
                                       sensitive: true,
                                       code_gen_sensitive: true,
                                       description: "Use a Bearer authorization token. Usually generated by Github Apps, e.g. GitHub Actions GITHUB_TOKEN environment variable",
                                       conflicting_options: [:api_token],
                                       optional: true,
                                       default_value: ENV["GITHUB_TOKEN"]),
          FastlaneCore::ConfigItem.new(key: :tag_name,
                                       env_name: "FL_GITHUB_RELEASE_TAG_NAME",
                                       description: "Pass in the tag name",
                                       optional: false),
          FastlaneCore::ConfigItem.new(key: :name,
                                       env_name: "FL_GITHUB_RELEASE_NAME",
                                       description: "Name of this release",
                                       optional: true),
          FastlaneCore::ConfigItem.new(key: :commitish,
                                       env_name: "FL_GITHUB_RELEASE_COMMITISH",
                                       description: "Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists. Default: the repository's default branch (usually master)",
                                       optional: true),
          FastlaneCore::ConfigItem.new(key: :description,
                                       env_name: "FL_GITHUB_RELEASE_DESCRIPTION",
                                       description: "Description of this release",
                                       optional: true,
                                       default_value: Actions.lane_context[SharedValues::FL_CHANGELOG],
                                       default_value_dynamic: true),
          FastlaneCore::ConfigItem.new(key: :is_draft,
                                       env_name: "FL_GITHUB_RELEASE_IS_DRAFT",
                                       description: "Whether the release should be marked as draft",
                                       optional: true,
                                       default_value: false,
                                       type: Boolean),
          FastlaneCore::ConfigItem.new(key: :is_prerelease,
                                       env_name: "FL_GITHUB_RELEASE_IS_PRERELEASE",
                                       description: "Whether the release should be marked as prerelease",
                                       optional: true,
                                       default_value: false,
                                       type: Boolean),
          FastlaneCore::ConfigItem.new(key: :is_generate_release_notes,
                                       env_name: "FL_GITHUB_RELEASE_IS_GENERATE_RELEASE_NOTES",
                                       description: "Whether the name and body of this release should be generated automatically",
                                       optional: true,
                                       default_value: false,
                                       type: Boolean),
          FastlaneCore::ConfigItem.new(key: :upload_assets,
                                       env_name: "FL_GITHUB_RELEASE_UPLOAD_ASSETS",
                                       description: "Path to assets to be uploaded with the release",
                                       optional: true,
                                       type: Hash,
                                       verify_block: proc do |value|
                                         UI.user_error!("upload_assets must be Array of paths to assets") unless value.kind_of?(Hash)
                                       end),
          FastlaneCore::ConfigItem.new(key: :overwrite_existing_assets,
                                       env_name: "FL_GITHUB_RELEASE_OVERWRITE_EXISTING_ASSETS",
                                       description: "Should existing assets be overwritten",
                                       optional: true,
                                       type: Boolean,
                                       default_value: false)
        ]
      end

      def self.output
        [
          ['SET_GITHUB_RELEASE_HTML_LINK', 'Link to your created release'],
          ['SET_GITHUB_RELEASE_RELEASE_ID', 'Release id (useful for subsequent editing)'],
        ]
      end

      def self.return_value
        [
          "A hash containing all relevant information of this release",
          "Access things like 'html_url', 'tag_name', 'name', 'body'"
        ].join("\n")
      end

      def self.return_type
        :hash
      end

      def self.authors
        ["czechboy0", "tommeier"]
      end

      def self.is_supported?(platform)
        true
      end

      def self.example_code
        [
          'github_release = github_release(
            repository_name: "fastlane/fastlane",
            api_token: ENV["GITHUB_TOKEN"],
            name: "Super New actions",
            tag_name: "v1.22.0",
            description: (File.read("changelog") rescue "No changelog provided"),
            commitish: "master",
            upload_assets: ["example_integration.ipa", "./pkg/built.gem"]
          )'
        ]
      end

      def self.category
        :source_control
      end
    end
  end
end
