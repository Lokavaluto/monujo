module Fastlane
  module Actions
    module SharedValues
      APP_NAME = :APP_NAME
      APP_ID = :APP_ID
      APP_DATA = :APP_DATA
    end

    class LoadAppDataAction < Action
      def self.run(params)
        data = params[:releases_data] || Actions.lane_context[SharedValues::RELEASES_DATA]
        if ! data
          UI.user_error! "No release data loaded. Can't continue."
        end
        app_info = data[params[:app]]
        if ! app_info
          UI.user_error!(
            "Unrecognized app label '#{params[:app]}', " +
            "please use one of: #{(data.keys + ["monujo"]).uniq.sort}")
        end
        Actions.lane_context[SharedValues::APP_NAME] = params[:app]
        Actions.lane_context[SharedValues::APP_ID] = app_info["app"]["id"]
        Actions.lane_context[SharedValues::APP_DATA] = app_info
        UI.message("Successfully loaded #{params[:app]} data. Ready for next steps.")
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Pick and load application data from list of releases in releases_data."
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :releases_data,
                                       env_name: "FL_LOAD_APP_DATA_RELEASES_DATA",
                                       description: "Hash containing data for releases",
                                       default_value: false),
          FastlaneCore::ConfigItem.new(key: :app,
                                       env_name: "FL_LOAD_APP_DATA_APP",
                                       description: "App identifier",
                                       default_value: false),
        ]
      end

      def self.output
        [
          ['APP_NAME', 'The application name'],
          ['APP_ID', 'The application id'],
          ['APP_DATA', 'The application data Hash'],
        ]
      end

      def self.return_value
        # If your method provides a return value, you can describe here what it does
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
