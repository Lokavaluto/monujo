
module Fastlane
  module Actions
    module SharedValues
      SCREENSHOT_CONFIG = :SCREENSHOT_CONFIG
    end

    class CheckScreenshotConfigAction < Action
      def self.run(params)

        if File.exist? ".screenshot.json"
          UI.message("Using configuration file '.screenshot.json'")
          screenshot_config = JSON.parse(File.read(".screenshot.json"))
        else
          UI.message("No configuration file '.screenshot.json' found.")
          screenshot_config = Hash.new
        end

        host = params[:host] || ENV["SCREENSHOT_HOST"] ||
               screenshot_config["host"]
        if ! host
          UI.important(
            "No screenshot host specified, default host provided in `config.json` will be used.\n" +
            "You might want to force a different host for screenshot purpose only.\n" +
            "  You then need to set up a screenshot host using either:\n" +
            "  - command line argument of fastlane 'screenshot' with 'host:http://myhost.com'\n" +
            "  - environment variable SCREENSHOT_HOST\n" +
            "  - configuration file '.screenshot.json', key 'host'.\n"
          )
        else
          UI.important(
            "Diverting app for screenshots towards administration server: #{host}"
          )
        end

        db = params[:db] || ENV["SCREENSHOT_DB"] ||
             screenshot_config["db"]
        if ! db
          UI.important(
            "No screenshot database specified, default database provided in `config.json` will be used.\n" +
            "You might want to force a different database for screenshot purpose only.\n" +
            "  You then need to set up a screenshot host using either:\n" +
            "  - command line argument of fastlane 'screenshot' with 'db:odoo'\n" +
            "  - environment variable SCREENSHOT_DB\n" +
            "  - configuration file '.screenshot.json', key 'db'.\n"
          )
        else
          UI.important(
            "Diverting app for screenshots towards administration database: #{db}"
          )
        end

        if File.exist? "cypress.env.json"
          UI.message("Using configuration file 'cypress.env.json'")
          cypress_config = JSON.parse(File.read("cypress.env.json"))
        else
          UI.message("No configuration file 'cypress.env.json' found.")
          cypress_config = Hash.new
        end

        login = params[:login] || ENV["SCREENSHOT_LOGIN"] ||
                screenshot_config["login"] || ENV["CYPRESS_EMAIL"] ||
                cypress_config["email"]
        if ! login
          UI.user_error!(
            "Please specify a screenshot login for login in and make screenshots." +
            "  You need to set up a screenshot login using either:\n" +
            "  - command line argument of fastlane 'login' with 'login:my@user.com'\n" +
            "  - environment variable SCREENSHOT_LOGIN\n" +
            "  - configuration file '.screenshot.json', key 'login'.\n" +
            "  - environment variable CYPRESS_EMAIL\n" +
            "  - configuration file 'cypress.env.json', key 'email'.\n"
          )
        end

        password = params[:password] || ENV["SCREENSHOT_PASSWORD"] ||
                   screenshot_config["password"] || ENV["CYPRESS_PASSWORD"] ||
                   cypress_config["password"]
        if ! password
          UI.user_error!(
            "Please specify a screenshot password for login in and make screenshots." +
            "  You need to set up a screenshot password using either:\n" +
            "  - command line argument of fastlane 'password' with 'password:mypass'\n" +
            "  - environment variable SCREENSHOT_PASSWORD\n" +
            "  - configuration file '.screenshot.json', key 'password'.\n" +
            "  - environment variable CYPRESS_PASSWORD\n" +
            "  - configuration file 'cypress.env.json', key 'password'.\n"
          )
        end

        resolution = (params[:resolution] || ENV["SCREENSHOT_RESOLUTION"] || "").split(",")
        resolution = screenshot_config["resolutions"] if resolution.length == 0
        if ! resolution || resolution.length == 0
          UI.user_error! "Please specify a screenshot resolution."
          UI.user_error!(
            "Please specify at least a screenshot resolution." +
            "  You need to set up a screenshot resolution using either:\n" +
            "  - command line argument of fastlane 'resolution' with 'resolution:375x667,1024x768'\n" +
            "  - environment variable SCREENSHOT_RESOLUTION\n" +
            "  - configuration file '.screenshot.json', key 'resolutions' as an array.\n"
          )
        else
          UI.message "Using resolution(s): #{resolution.join(", ")}"
          resolution = resolution.join(",")
        end

        language = (params[:language] || ENV["SCREENSHOT_LANGUAGE"] || "").split(",")
        language = screenshot_config["languages"] if language.length == 0
        if ! language || language.length == 0
          UI.important(
            "No language specified, will create screenshots in all available languages from `config.json`.\n" +
            "  You can limit to one or more languages using either:\n" +
            "  - command line argument of fastlane 'language' with 'language:fr-FR,en-US'\n" +
            "  - environment variable SCREENSHOT_LANGUAGE\n" +
            "  - configuration file '.screenshot.json', key 'languages' as an array.\n"
          )
        else
          UI.message "Using language(s): #{language.join(", ")}"
          language = language.join(",")
        end


        Actions.lane_context[SharedValues::SCREENSHOT_CONFIG] = {
          language: language,
          db: db,
          host: host,
          login: login,
          password: password,
          resolution: resolution,
        }

      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Check and prepare environment variables for android keystore and password required for signing."
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(
            key: :host,
            env_name: "FL_CHECK_SCREENSHOT_CONFIG_HOST",
            description: "Administrative backend host to connect for screenshots",
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :db,
            env_name: "FL_CHECK_SCREENSHOT_CONFIG_DB",
            description: "Database on administrative backend to connect to",
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :login,
            env_name: "FL_CHECK_SCREENSHOT_CONFIG_LOGIN",
            description: "Login of user to connect to administrative backend for screenshots",
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :password,
            env_name: "FL_CHECK_SCREENSHOT_CONFIG_PASSWORD",
            description: "Password for user login on administrative backend for screenshots",
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :resolution,
            env_name: "FL_CHECK_SCREENSHOT_CONFIG_RESOLUTION",
            description: "Resolution(s) to make screenshots to",
            default_value: false),
          FastlaneCore::ConfigItem.new(
            key: :language,
            env_name: "FL_CHECK_SCREENSHOT_CONFIG_PASSWORD",
            description: "language(s) of user interface to make screenshots",
            default_value: false),
        ]
      end

      def self.output
        [
          ['SCREENSHOT_CONFIG', 'Screenshot config'],
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
