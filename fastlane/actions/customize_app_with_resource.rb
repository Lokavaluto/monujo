module Fastlane
  module Actions

    class CustomizeAppWithResourceAction < Action
      def self.run(params)
        require 'zip'
        require 'ox'

        app_data = Actions.lane_context[SharedValues::APP_DATA]

        url = params[:url] || app_data["data"]
        app_id = params[:app_id] || app_data["app"]["id"]
        app_name = params[:app_name] || app_data["app"]["name"]

        UI.message "App id: '#{app_id}', name: #{app_name}"

        dest = params[:dest] || Actions.lane_context[SharedValues::SANDBOX_PATH]

        if ! url
          UI.user_error "Missing URL."
        end
        if ! dest
          UI.user_error "Missing Dest."
        end

        ##
        ## Download resources
        ##

        uri = URI.parse(url)
        response = Net::HTTP.get_response(uri)

        if response.code != "200"
          UI.user_error!("Could not load application information.")
        end

        FileUtils.mkdir_p(dest)

        ##
        ## Unzip resources
        ##

        Zip::File.open_buffer(response.body) do |zip_file|
          dir = false
          zip_file.each do |f|
            ## Lots of useless mac junk files that should not be sent
            ## in final package
            path = Pathname(f.name).each_filename.to_a
            if dir === false
              dir = path.shift
              UI.message "Extracting subdirectory '#{dir}' to package root:"
            else
              if dir != path.shift
                UI.user_error! "Incorrect zip file having more than one subdir."
              end
            end

            shortened_path = File.join(*path)
            if shortened_path === ''
              next
            end
            if ! ["public", "resources"].include? path[0]
              UI.message "  Ignored:         #{shortened_path} ('#{path[0]}' subdir is not whitelisted)."
              next
            end
            if File.basename(shortened_path).start_with? ".DS_"
              UI.message "  Ignored:         #{shortened_path} (Junk file)"
              next
            end
            fpath = File.join(dest, shortened_path)
            if File.exist? fpath
              UI.success "  Extract: REPLACE #{shortened_path}"
            else
              UI.success "  Extract: NEW     #{shortened_path}"
            end
            zip_file.extract(f, fpath) { true }
          end
        end

        ##
        ## Make 'capacitor.config.ts'
        ##

        Dir.chdir(dest) do
          ## check json
          config = File.read('./public/config.json')
          JSON.parse(config)  ## If parsing fails, will trigger an error

          ## Make 'capacitor.config.ts'

          File.write('capacitor.config.ts', "
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '#{app_id}',
  appName: \"#{app_name}\",
  webDir: 'dist',
  bundledWebRuntime: false
};

export default config;
")

          ##
          ## Update files with app id and app name
          ##

          if app_id != "com.lokavaluto.monujo"

            platform = Actions.lane_context[SharedValues::PLATFORM_NAME]
            if not platform
              next
            end

            Dir.chdir(Actions.lane_context[SharedValues::SANDBOX_PATH]) do

              UI.important "Replacing application identifier by '#{app_id}'."
              ## Replace app_id in files
              Find.find platform.to_s do |path|
                if FileTest.directory? path
                  next
                end
                if open(path).each.find { |line| line.include?("com.lokavaluto.monujo") }
                  UI.message "  Found and replacing string in '#{path}'"
                  contents = File.open(path).read
                  contents.gsub!("com.lokavaluto.monujo", app_id)
                  File.open(path, "w+") { |f| f.write(contents) }
                end
              end

              case platform
              when :android

                ## Replace app_id in directory structure

                UI.message "  Rebuild directory structure"
                dir_path = "android/app/src/main/java/#{app_id.split(".").join("/")}"
                FileUtils.mkdir_p(dir_path)
                FileUtils.mv(
                  "android/app/src/main/java/com/lokavaluto/monujo/MainActivity.java",
                  "#{dir_path}/MainActivity.java")
                sh "find 'android/app/src/main/java' -depth -type d -empty -delete"

                ## Replace app_name in Manifest

                strings_path = "android/app/src/main/res/values/strings.xml"
                strings = Ox.load_file(strings_path)

                UI.message "  Replacing XML strings:"
                strings.resources.nodes.each do |element|
                  next if ! element.respond_to? :name
                  next if ! ["app_name", "title_activity_main"].include?(element['name'])
		          element.replace_text(app_name.gsub("'", %q(\\\')))
                  UI.message "    Overridden #{element['name']} with: #{app_name}"
			    end

                File.write(strings_path, Ox.dump(strings))
              when :ios
                other_action.update_info_plist(
                  xcodeproj: "#{Actions.lane_context[SharedValues::SANDBOX_PATH]}/ios/App/App.xcodeproj",
                  plist_path: "App/Info.plist",
                  app_identifier: app_id,
                  display_name: app_name)
              end
            end
          end

          UI.message sh('git status --porcelain', print_command_output: false)
          UI.message sh('git diff', print_command_output: false)
        end
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Customizes source repository to the given data resources to make it ready for producing other apps."
      end

      def self.details
        # Optional:
        # this is your chance to provide a more detailed description of this action
        "You can use this action to do cool things..."
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :url,
                                       env_name: "FL_CUSTOMIZE_APP_WITH_RESOURCE_URL",
                                       description: "URL to ZIP archive to unpack in root repository",
                                       default_value: false),
          FastlaneCore::ConfigItem.new(key: :dest,
                                       env_name: "FL_CUSTOMIZE_APP_WITH_RESOURCE_DEST",
                                       description: "Path of source repository to customize",
                                       default_value: false),
          FastlaneCore::ConfigItem.new(key: :app_id,
                                       env_name: "FL_CUSTOMIZE_APP_WITH_RESOURCE_APP_ID",
                                       description: "Application id to set source to",
                                       default_value: false),
          FastlaneCore::ConfigItem.new(key: :app_name,
                                       env_name: "FL_CUSTOMIZE_APP_WITH_RESOURCE_APP_NAME",
                                       description: "Application name to set source to",
                                       default_value: false),
        ]
      end

      def self.output
        []
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
