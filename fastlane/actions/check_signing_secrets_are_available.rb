require "base64"
require "tempfile"

module Fastlane
  module Actions
    module SharedValues
      ANDROID_KEYSTORE = :ANDROID_KEYSTORE
      ANDROID_KEY_ALIAS = :ANDROID_KEY_ALIAS
    end

    class CheckSigningSecretsAreAvailableAction < Action
      def self.run(params)

        ##
        ## Keystore
        ##

        keystore_base64 = params[:keystore_base64] ||
                          ENV["KEYSTORE_BASE64"]

        if keystore_base64
          keystore = Base64.decode64(keystore_base64)
          keystore_file = Tempfile.new('fastlane_keystore_').path
          File.binwrite(keystore_file, keystore)
          UI.message "Found and using keystore in environment from base64"
        else
          keystore_file = params[:keystore_file] || "keys/keystore"
          if File.readable? keystore_file
            UI.success "Found and using keystore from file '#{keystore_file}'."
          else
            UI.important "File '#{keystore_file}' not readable."
            keystore_file = false
          end
        end

        if ! keystore_file
          UI.user_error! "Keystore not found. Please provide either:
 - a \$KEYSTORE_BASE64 environment variable with the base64 content
   of your keystore
 - use 'keystore_file:FILE' to provide path to a binary keystore

Note that, by default, a keystore file is looked up in:
  keys/keystore
"
        end
        Actions.lane_context[SharedValues::ANDROID_KEYSTORE] = Pathname.new(keystore_file).realpath


        ##
        ## Keystore password
        ##

        keystore_password = params[:keystore_password] ||
                            ENV["RELEASE_KEYSTORE_PASSWORD"]

        if ! keystore_password
          keystore_password_file = params[:keystore_password_file] ||
                                   "keys/keystore-password"
          if File.readable? keystore_password_file
            keystore_password = File.open(keystore_password_file).read.chomp
            UI.success "Found and using keystore password from file '#{keystore_password_file}'."
          else
            UI.message "File '#{keystore_password_file}' not readable."
          end
        end

        if ! keystore_password
          UI.user_error! "Keystore password not found. Please provide either:
 - a \$RELEASE_KEYSTORE_PASSWORD environment variable holding the password
 - use 'keystore_password:PASSWORD' to provide the password
 - use 'keystore_password_file:FILE' to provide a file containing
   the password

Note that by default, a keystore password file is looked up in:
  keys/keystore-password"
        end
        ENV["RELEASE_KEYSTORE_PASSWORD"] = keystore_password

        ##
        ## Key alias
        ##

        ## Not yet configurable
        Actions.lane_context[SharedValues::ANDROID_KEY_ALIAS] = "lokakey0"
        ENV["RELEASE_KEY_PASSWORD"] = keystore_password

      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Check and prepare environment variables for android keystore and password required for signing."
      end

      def self.available_options
        [

          ## Keystore
          FastlaneCore::ConfigItem.new(
            key: :keystore_base64,
            env_name: "FL_CHECK_SIGNING_SECRETS_ARE_AVAILABLE_KEYSTORE_BASE64",
            description: "Content of keystore encoded in base64",
            conflicting_options: [:keystore_file],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :keystore_file,
            env_name: "FL_CHECK_SIGNING_SECRETS_ARE_AVAILABLE_KEYSTORE_FILE",
            description: "Path of keystore file",
            conflicting_options: [:keystore_base64],
            default_value: false),

          ## Password
          FastlaneCore::ConfigItem.new(
            key: :keystore_password,
            env_name: "FL_CHECK_SIGNING_SECRETS_ARE_AVAILABLE_KEYSTORE_PASSWORD",
            description: "Keystore password",
            conflicting_options: [:keystore_password_file],
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :keystore_password_file,
            env_name: "FL_CHECK_SIGNING_SECRETS_ARE_AVAILABLE_KEYSTORE_PASSWORD_FILE",
            description: "Path to file containing keystore password",
            conflicting_options: [:keystore_password],
            default_value: false),
        ]
      end

      def self.output
        [
          ['ANDROID_KEYSTORE', 'Path to file containing keystore'],
          ['ANDROID_KEY_ALIAS', 'Key alias in keystore'],
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
