module Fastlane
  module Actions
    module SharedValues
      RELEASES_DATA = :RELEASES_DATA
    end

    class LoadReleasesDataAction < Action
      def self.run(params)
        require 'net/http'
        require 'uri'
        require 'yaml'

        release_info_url = ENV["RELEASE_INFO_URL"] || params[:url] ||
                           "https://docker.0k.io/downloads/lokavaluto-releases.yml"

        uri = URI.parse(release_info_url)
        response = Net::HTTP.get_response(uri)

        if response.code != "200"
          UI.user_error!("Could not load releases information.")
        end

        data = YAML.load(response.body)
        Actions.lane_context[SharedValues::RELEASES_DATA] = data
        data
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Fetch list of release data"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :url,
                                       env_name: "FL_LOAD_APP_DATA_URL",
                                       description: "URL of YAML description of available releases",
                                       default_value: false),
        ]
      end

      def self.output
        [
          ['RELEASES_DATA', 'Full releases data']
        ]
      end

      def self.return_value
        "Hash of different flavors of the app"
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
