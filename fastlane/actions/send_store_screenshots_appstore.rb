require 'fileutils'

module Fastlane
  module Actions
    module SharedValues
    end

    class SendStoreScreenshotsAppstoreAction < Action
      def self.run(params)
        app_name = Actions.lane_context[SharedValues::APP_NAME]
        version_name = Actions.lane_context[SharedValues::VERSION_NAME]

        devices_ios_resolution = params[:devices_ios_resolution]

        tmpdir ||= Dir.mktmpdir
        dst_path = "#{tmpdir}/#{version_name}/#{app_name}/ios"

        UI.message "Temporary list screenshots for App Store Connect in #{dst_path}"
        devices_ios_resolution.each do |device, resolution|
          screenshots = Actions.lane_context[SharedValues::TAKE_SCREENSHOTS_REPORT] || {}

          screenshots.entries.each do |screenshot, metadata|
            next if metadata[:resolution] != resolution
            symlink_path = File.join(dst_path, metadata[:language])
            FileUtils.mkdir_p(symlink_path) unless Dir.exist?(symlink_path)

            link_name = File.join(symlink_path, "#{device}_#{File.basename(screenshot)}")
            File.symlink(
              File.join(Dir.pwd, screenshot), link_name) unless File.exist?(link_name)
          end
        end

        ## deliver will still check `ipa` even if `skip_binary_upload` is true
        Actions.lane_context.delete(SharedValues::IPA_OUTPUT_PATH)
        Actions.lane_context.delete(SharedValues::PKG_OUTPUT_PATH)

        other_action.deliver(
          app_identifier: lane_context[SharedValues::APP_ID],
          app_version: lane_context[SharedValues::VERSION_NAME].gsub(/-rc\.[0-9]+$/, ''),
          screenshots_path: dst_path,
          skip_binary_upload: true,
          skip_metadata: true,
          overwrite_screenshots: true,
          run_precheck_before_submit: false,
          force: true
        )

      end

      def self.description
        "Generates iOS screenshots and creates symbolic links for App Store Connect release"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :devices_ios_resolution,
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
