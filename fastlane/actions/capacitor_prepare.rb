module Fastlane
  module Actions

    class CapacitorPrepareAction < Action
      def self.run(params)
        Dir.chdir(Actions.lane_context[SharedValues::SANDBOX_PATH]) do

          platform = Actions.lane_context[SharedValues::PLATFORM_NAME]

          sh "npx cordova-res #{platform} --skip-config --copy"
          sh "npx cap sync #{platform}"

          if platform == :android
            ## Bug workaround
            ## cf: https://github.com/ionic-team/capacitor-assets/issues/110#issuecomment-889076638
            ## Loose equivalent to:
            # sed -i 's/@color\//@mipmap\//g' android/app/src/main/res/mipmap-anydpi-v26/ic_launcher*.xml

            Find.find(*Dir.glob("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher*.xml")) do |path|
              if FileTest.directory? path
                next
              end
              if open(path).each.find { |line| line.include?("@color/") }
                UI.message "BUGFIX: replacing bogus info in #{path}"
                contents = File.open(path).read
                contents.gsub!("@color/", "@mipmap/")
                File.open(path, "w+") { |f| f.write(contents) }
              end
            end
          end

        end
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Prepare capacitor repository for mobile native build"
      end

      def self.available_options
        []
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
        [:ios, :android].include?(platform)
      end
    end
  end
end
