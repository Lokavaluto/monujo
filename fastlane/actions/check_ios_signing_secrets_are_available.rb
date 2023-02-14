require "json"

module Fastlane
  module Actions
    module SharedValues
    end

    class CheckIosSigningSecretsAreAvailableAction < Action
      def self.run(params)

        api_key = params[:api_key] || ENV["API_KEY"]

        if api_key
          UI.message "Found and using App Store Connect Key in environment"
        else
          api_key_path = params[:api_key_path] ||
                    ENV["API_KEY_PATH"] || "keys/ios/api_key.json"

          if File.readable? api_key_path
            UI.success "Found and using App Store Connect Key from file '#{api_key_path}'."
            api_key = File.read api_key_path
          else
            UI.important "File '#{api_key_path}' not readable."
            api_key = false
          end
        end

        if ! api_key
          UI.user_error! "Api Key not found. Please provide either:
 - a \$API_KEY environment variable with the JSON content
   as described in:
   https://docs.fastlane.tools/app-store-connect-api/#using-fastlane-api-key-json-file
 - or a \$API_KEY_PATH environment variable toward the JSON file path
   with content as described in the previous section.
 - use 'api_key_path:FILE' to provide path to a JSON file with
   content as described in the first section.

Note that, by default, a keystore file is looked up in:
  keys/ios/api_key.json
"
        end

        key_json = JSON.parse api_key
        key = {
          key_id: key_json["key_id"],
          issuer_id: key_json["issuer_id"],
          key: key_json["key"],
          is_key_content_base64: false,
          duration: key_json["duration"],
          in_house: key_json["in_house"]
        }

        Actions.lane_context.set_sensitive(SharedValues::APP_STORE_CONNECT_API_KEY, key)
        Spaceship::ConnectAPI.token = Spaceship::ConnectAPI::Token.create(**key) if params[:set_spaceship_token]

      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Check and prepare context variables for ios App Store Connect required for signing."
      end

      def self.available_options
        [

          ## Keystore
          FastlaneCore::ConfigItem.new(
            key: :api_key,
            env_name: "FL_CHECK_IOS_SIGNING_SECRETS_ARE_AVAILABLE_API_KEY",
            description: "Content of api key in JSON",
            conflicting_options: [:api_key_path],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :api_key_path,
            env_name: "FL_CHECK_IOS_SIGNING_SECRETS_ARE_AVAILABLE_API_KEY_PATH",
            description: "Path of JSON api key file",
            conflicting_options: [:api_key],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :set_spaceship_token,
            env_name: "FL_CHECK_IOS_SIGNING_SECRETS_ARE_AVAILABLE_SET_SPACESHIP_TOKEN",
            description: "Authorizes all Spaceship::ConnectAPI requests by automatically setting Spaceship::ConnectAPI.token",
            type: Boolean,
            default_value: true),
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
        [:ios].include?(platform)
      end
    end
  end
end
