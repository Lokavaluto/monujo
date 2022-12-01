

module Fastlane
  module Actions

    class VersionPrepareAction < Action
      def self.run(params)

        platform = Actions.lane_context[SharedValues::PLATFORM_NAME]

        version_name = params[:version_name] || lane_context[SharedValues::VERSION_NAME]
        version_code = params[:version_code] || lane_context[SharedValues::VERSION_CODE]

        root_path = Actions.lane_context[SharedValues::SANDBOX_PATH]

        ## Version name and version code

        case platform
        when :android

          ## Replace versionCode and versionName in build.gradle
          #compat_sed_i 's/^(\s+versionCode\s+).*$/\1'"$version_code"'/;
          #   s/^(\s+versionName\s+).*$/\1'"'$tag'"'/' \
          #   android/app/build.gradle

          UI.message "  Enforcing versionCode and versionName in build.gradle"
          path = "#{root_path}/android/app/build.gradle"
          contents = File.open(path).read
          contents.sub!(/^(\s+versionCode\s+).*$/) { "#{$1}#{version_code}" }
          contents.sub!(/^(\s+versionName\s+).*$/) { "#{$1}'#{version_name}'" }
          File.open(path, "w+") { |f| f.write(contents) }

        when :ios
          other_action.increment_version_number(
            version_number: version_name,
            xcodeproj: "#{root_path}/ios/App/App.xcodeproj"
          )
          other_action.increment_build_number(
            build_number: version_code,
            xcodeproj: "#{root_path}/ios/App/App.xcodeproj"
          )
        end
        Dir.chdir(root_path) do
          UI.message sh('git diff', print_command_output: false)
        end
        UI.success("Prepared #{platform} build files for version #{version_name} (#{version_code})")
      end
      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Prepare capacitor repository for mobile native build"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :version_name,
                                       env_name: "FL_VERSION_PREPARE_VERSION_NAME",
                                       description: "Version name (ex: '1.0.0-rc.4')",
                                       default_value: false),
          FastlaneCore::ConfigItem.new(key: :version_code,
                                       env_name: "FL_VERSION_PREPARE_VERSION_CODE",
                                       description: "Build code (integer)",
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
        true
      end
    end
  end
end
