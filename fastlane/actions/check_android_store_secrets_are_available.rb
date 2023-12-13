
module Fastlane
  module Actions
    module SharedValues
    end

    class CheckAndroidStoreSecretsAreAvailableAction < Action
      def self.run(params)

        api_key = params[:api_key] || ENV["PLAY_STORE_API_KEY"]

        if api_key and api_key != ""
          UI.message "Found and using Google Play Store API Key in environment"
        else
          api_key_path = params[:api_key_path] ||
                    ENV["PLAY_STORE_API_KEY_PATH"] || "keys/android/api_key.json"

          if File.readable? api_key_path
            UI.success "Found and using Google Play Store API Key from file '#{api_key_path}'."
            api_key = File.read api_key_path
          else
            UI.important "File '#{api_key_path}' not readable."
            api_key = false
          end
        end

        if ! api_key
          UI.user_error! "Api Key not found. Please provide either:
 - a \$PLAY_STORE_API_KEY environment variable with the JSON content
   as described in:
   https://docs.fastlane.tools/actions/supply/#setup
 - or a \$PLAY_STORE_API_KEY_PATH environment variable toward the JSON file path
   with content as described in the previous section.
 - use 'api_key_path:FILE' to provide path to a JSON file with
   content as described in the first section.

Note that, by default, a JSON API key file is looked up in:
  keys/android/api_key.json
"
        end

        Supply.config = {
          json_key_data: api_key,
          release_status: Supply::ReleaseStatus::DRAFT,
          track: Supply::Tracks::INTERNAL,
        }
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Check and prepare context variables for android App Store Connect required for signing."
      end

      def self.available_options
        [

          ## Keystore
          FastlaneCore::ConfigItem.new(
            key: :api_key,
            env_name: "FL_CHECK_ANDROID_STORE_SECRETS_ARE_AVAILABLE_API_KEY",
            description: "Content of api key in JSON",
            conflicting_options: [:api_key_path],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :api_key_path,
            env_name: "FL_CHECK_ANDROID_STORE_SECRETS_ARE_AVAILABLE_API_KEY_PATH",
            description: "Path of JSON api key file",
            conflicting_options: [:api_key],
            default_value: false),
        ]
      end

      def self.output
        [
        ]
      end

      def self.return_value
      end

      def self.authors
        ["Valentin Lab"]
      end

      def self.is_supported?(platform)
        [:android].include?(platform)
      end
    end
  end
end
