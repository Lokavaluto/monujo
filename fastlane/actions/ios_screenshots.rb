require 'fileutils'

module Fastlane
  module Actions
    module SharedValues
      STORE_SCREENSHOTS_ROOT = :STORE_SCREENSHOTS_ROOT
      STORE_SCREENSHOTS_PATH = :STORE_SCREENSHOTS_PATH
    end

    class IosScreenshotsAction < Action
      def self.run(params)
        app_name = Actions.lane_context[SharedValues::APP_NAME]
        version_name = Actions.lane_context[SharedValues::VERSION_NAME]

        devices_resolution = params[:devices_resolution]

        Actions.lane_context[SharedValues::STORE_SCREENSHOTS_ROOT] ||= Dir.mktmpdir
        Actions.lane_context[SharedValues::STORE_SCREENSHOTS_PATH] = dst_path =
          "#{Actions.lane_context[SharedValues::STORE_SCREENSHOTS_ROOT]}/#{version_name}/#{app_name}/ios"

        UI.message "Temporary list screenshots for App Store Connect in #{dst_path}"
        devices_resolution.each do |device, resolution|
          screenshots = Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_REPORT]

          screenshots.entries.each do |screenshot, metadata|
            next if metadata[:resolution] != resolution
            symlink_path = File.join(dst_path, metadata[:language])
            FileUtils.mkdir_p(symlink_path) unless Dir.exist?(symlink_path)

            link_name = File.join(symlink_path, "#{device}_#{File.basename(screenshot)}")
            File.symlink(
              File.join(Dir.pwd, screenshot), link_name) unless File.exist?(link_name)
          end
        end
      end

      def self.description
        "Generates iOS screenshots and creates symbolic links for App Store Connect release"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :devices_resolution,
                                       description: "List of devices",
                                       type: Hash,
                                       optional: false),
        ]
      end

      def self.is_supported?(platform)
        platform == :ios
      end
    end
  end
end
