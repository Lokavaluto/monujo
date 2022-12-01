module Fastlane
  module Actions
    module SharedValues
      VERSION_NAME = :VERSION_NAME
    end

    class VersionNameFromTagAction < Action
      def self.run(params)
        tag = params[:tag] || false
        if ! tag
          sh("git describe --tags --exact-match",
             print_command: false,
             print_command_output: false) do |exit_status, result|
            if exit_status == 0
              tag = result.strip
            else
              UI.user_error!("Can't find a tag on current commit")
            end
          end
          UI.important "Tag was not specified, using current tag '#{tag}' as version name."
        else
          if ! other_action.git_tag_exists tag: tag
            UI.user_error!("Tag #{tag} was not found in current git repository.")
          end
          UI.success "Specified tag '#{tag}' found. Using as version name."
        end
        Actions.lane_context[SharedValues::VERSION_NAME] = tag
        tag
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Infer version_name from current or given tag"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :tag,
                                       env_name: "FL_GET_TAG_TAG",
                                       description: "Set version name from given tag",
                                       default_value: false),
        ]
      end

      def self.output
        [
          ['VERSION_NAME', 'Tag value']
        ]
      end

      def self.return_value
        "Version name"
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
