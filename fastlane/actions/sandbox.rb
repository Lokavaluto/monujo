module Fastlane
  module Actions
    module SharedValues
      SANDBOX_PATH = :SANDBOX_PATH
    end

    class SandboxAction < Action
      def self.run(params)
        tag = params[:tag] || Actions.lane_context[SharedValues::VERSION_NAME]
        app = params[:app] || Actions.lane_context[SharedValues::APP_NAME]
        path = Dir.mktmpdir()
        git_toplevel = (sh 'git rev-parse --show-toplevel').strip
        UI.message "Temporary path: #{path}"
        Actions.lane_context[SharedValues::SANDBOX_PATH] = "#{path}/#{app}"
        Dir.chdir(path) do
          sh "git clone -qb \"#{tag}\" --depth 1 \"#{git_toplevel}\" \"#{app}\" 2>&1"
        end
        UI.message "Sandbox path: #{lane_context[SharedValues::SANDBOX_PATH]}"
        lane_context[SharedValues::SANDBOX_PATH]
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Clone current source in given tag in a temporary directory and return path"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :tag,
                                       env_name: "FL_SANDBOX_TAG",
                                       description: "Tag of source git repository to checkout in sandbox",
                                       default_value: false),
          FastlaneCore::ConfigItem.new(key: :app,
                                       env_name: "FL_SANDBOX_APP",
                                       description: "Name of the sandbox",
                                       default_value: false),
        ]
      end

      def self.output
        [
          ['SANDBOX_PATH', 'Full path of the sandbox directory']
        ]
      end

      def self.return_value
        "Sandbox path"
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
