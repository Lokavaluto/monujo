module Fastlane
  module Actions
    module SharedValues
    end

    class CheckIosStoreSecretsAreAvailableAction < Action
      def self.run(params)

        if not Actions.lane_context[SharedValues::APP_STORE_CONNECT_API_KEY]
          Fastlane::Actions::CheckIosSigningSecretsAreAvailableAction.run(params)
        end
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
            env_name: "FL_CHECK_IOS_STORE_SECRETS_ARE_AVAILABLE_API_KEY",
            description: "Content of api key in JSON",
            conflicting_options: [:api_key_path],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :api_key_path,
            env_name: "FL_CHECK_IOS_STORE_SECRETS_ARE_AVAILABLE_API_KEY_PATH",
            description: "Path of JSON api key file",
            conflicting_options: [:api_key],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :match_password,
            env_name: "FL_CHECK_IOS_STORE_SECRETS_ARE_AVAILABLE_MATCH_PASSWORD",
            description: "Match password",
            conflicting_options: [:match_password],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :match_password_path,
            env_name: "FL_CHECK_IOS_STORE_SECRETS_ARE_AVAILABLE_MATCH_PASSWORD_PATH",
            description: "Path of match password file",
            conflicting_options: [:match_password],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :set_spaceship_token,
            env_name: "FL_CHECK_IOS_STORE_SECRETS_ARE_AVAILABLE_SET_SPACESHIP_TOKEN",
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
