require 'json'
require 'shellwords'


module Fastlane
  module Actions
    module SharedValues
      TAKE_SCREENSHOTS_REPORT = :TAKE_SCREENSHOTS_REPORT
      TAKE_SCREENSHOTS_NEED_RUN = :TAKE_SCREENSHOTS_NEED_RUN
    end

    class TakeScreenshotsAction < Action
      def self.run(params)

        app = Actions.lane_context[SharedValues::APP_NAME]
        version_name = Actions.lane_context[SharedValues::VERSION_NAME]

        Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_NEED_RUN] = false

        if not Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_REPORT]
          Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_REPORT] = {}
        end

        if File.exist? ".screenshot.json"
          screenshot_config = JSON.parse(File.read(".screenshot.json")) || Hash.new
        end

        host = params[:host] || ENV["SCREENSHOT_HOST"] ||
               screenshot_config["host"]
        if ! host
          UI.user_error! "Please specify a screenshot host."
        end

        db = params[:db] || ENV["SCREENSHOT_DB"] ||
               screenshot_config["db"]
        if ! db
          UI.user_error! "Please specify a screenshot db."
        end

        login = params[:login] || ENV["SCREENSHOT_LOGIN"]
        if ! login
          UI.user_error! "Please specify a screenshot login to given screenshot host."
        end

        password = params[:password] || ENV["SCREENSHOT_PASSWORD"]
        if ! password
          UI.user_error! "Please specify a screenshot password to given screenshot host."
        end

        resolution = params[:resolution] || ENV["SCREENSHOT_RESOLUTION"]
        if ! resolution
          UI.user_error! "Please specify a screenshot resolution."
        end
        resolution = resolution.split(",")

        ##
        ## Modify json to connect to screenshot host
        ##

        ## In dry run mode, the built was probably not done yet, so we
        ## can't access the ``dist/`` directory. We want to read the
        ## ``config.json`` file in ``public/`` directory to get the
        ## available languages.

        target_directory = params[:dry_run] ? "public" : "dist"

        config_path = "#{Actions.lane_context[SharedValues::SANDBOX_PATH]}/#{target_directory}/config.json"
        config = JSON.parse(File.read(config_path))

        ## In dry run mode, we don't want to modify the dist ``config.json`` file
        ## as this mode is meant to be called before the build of the package.
        if not params[:dry_run]
          config['lokapiHost'] = host if host
          config['lokapiDb'] = db if db
          config['locales']['preferNavigatorLanguage'] = false
          File.write(config_path, JSON.pretty_generate(config))
        end

        available_languages = config['locales']['availableLanguages'].keys
        language = params[:language] || ENV["SCREENSHOT_LANGUAGE"]
        if language
          language = language.split(",")
          language.each do |l|
            if not available_languages.include?(l)
              UI.important "Specified language #{l} is not an available language for #{app}\n" +
                            "  #{app} has only these language available: #{available_languages.join(", ")}"
            end
          end
        end

        languages = available_languages.filter do |current_language|
          if language and not language.include? current_language
            UI.important "Skipping language #{current_language} as it was not selected for " +
                         "screenshot.\n" +
                         "  Selected resolutions: #{language.join(", ")}"
            false
          else
            true
          end
        end
        if languages.length == 0
          UI.user_error! "No language selected!"
        end
        languages.each do |current_language|

          resolution.each do |r|

            result_dir="release/#{version_name}/screenshots/#{app}/#{current_language}/#{r}"

            report_entry = {
              version_name: version_name,
              app: app,
              language: current_language,
              resolution: r,
            }

            if File.exist? result_dir
              if ! params[:force]
                UI.important("Screenshot of #{app} in " +
                             "language #{current_language} and resolution #{r} " +
                             "already exists.\n  Location: #{result_dir}.\n")
                UI.message("  Ignoring build. If you want to overwrite it, " +
                           "provide 'force:true' as an argument.")
                report_entry[:new] = false
                Dir.glob("#{result_dir}/*.png").each do |screenshot|
                  Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_REPORT][screenshot] = report_entry
                end
                next
              else
                UI.important "Existing screenshot directory for #{app} #{result_dir} will be overwritten."
                #FileUtils.rm_rf(result_dir)
              end
            end

            if params[:dry_run]
              Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_NEED_RUN] = true
              return
            end

            config['locales']['defaultLanguage'] = current_language
            File.write(config_path, JSON.pretty_generate(config))

            ##
            ## Launch cypress
            ##

            if r.split("x").count == 2
              r = r + "x1"
            end

            UI.message "Launching cypress on #{app} for screenshots in #{current_language} in #{r}..."
            width, height, scale = r.split("x")
            cypress_params = {
              "email" => login,
              "password" => password,
              "screenshot" => true,
              "scaleFactor" => scale
            }
            cypress_config = {
              "defaultCommandTimeout" => 30000,
              "pageLoadTimeout" => 30000,
              "viewportWidth" => width.to_i,
              "viewportHeight" => height.to_i,
              "video" => false,
            }

            Dir.chdir(Actions.lane_context[SharedValues::SANDBOX_PATH]) do
              sh ("npx cypress run --spec tests/e2e/spec.cy.ts " +
                  "--env #{Shellwords.escape(cypress_params.to_json)} " +
                  "--config #{Shellwords.escape(cypress_config.to_json)} " +
                  "--browser chrome"
                 )
            end

            FileUtils.mkdir_p result_dir
            FileUtils.mv(
              Dir.glob(Actions.lane_context[SharedValues::SANDBOX_PATH] +
                       "/.cypress/screenshots/spec.cy.ts/*.png"),
              result_dir)

            report_entry[:new] = true
            Dir.glob("#{result_dir}/*.png").each do |screenshot|
              Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_REPORT][screenshot] = report_entry
            end
          end
        end
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Create screenshots for the current app"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(
            key: :host,
            env_name: "FL_SCREENSHOT_HOST",
            default_value: false
          ),
          FastlaneCore::ConfigItem.new(
            key: :db,
            env_name: "FL_SCREENSHOT_LANGUAGE",
            default_value: false
          ),
          FastlaneCore::ConfigItem.new(
            key: :login,
            env_name: "FL_SCREENSHOT_LOGIN",
            default_value: false
          ),
          FastlaneCore::ConfigItem.new(
            key: :password,
            env_name: "FL_SCREENSHOT_PASSWORD",
            default_value: false
          ),
          FastlaneCore::ConfigItem.new(
            key: :resolution,
            env_name: "FL_SCREENSHOT_RESOLUTION",
            default_value: "375x667"
          ),
          FastlaneCore::ConfigItem.new(
            key: :language,
            env_name: "FL_SCREENSHOT_LANGUAGE",
            default_value: false
          ),
          FastlaneCore::ConfigItem.new(
            key: :force,
            env_name: "FL_SCREENSHOT_FORCE",
            type: Boolean,
            default_value: false
          ),
          FastlaneCore::ConfigItem.new(
            key: :dry_run,
            env_name: "FL_SCREENSHOT_DRY_RUN",
            type: Boolean,
            default_value: false
          ),
        ]
      end

      def self.output
      end

      def self.return_value
      end

      def self.authors
        ["Valentin Lab"]
      end

      def self.is_supported?(platform)
        true
      end
    end
  end
end
