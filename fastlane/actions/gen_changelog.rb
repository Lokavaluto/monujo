module Fastlane
  module Actions

    class GenChangelogAction < Action
      def self.run(params)
        if ! system('which gitchangelog >/dev/null')
          UI.important "No 'gitchangelog' executable found. Skipping changelog generation."
          return
        end
        tag = params[:tag] || lane_context[SharedValues::VERSION_NAME] ||
              other_action.version_name_from_tag
        if tag.include? "-rc."
          ## Release candidate mode
          title = "Release candidate #{tag}"
          prev = (sh("git tag | grep -E \"^[0-9]+\\.[0-9]+\\.[0-9]+(-rc\\.[0-9]+)?$\" | " +
                     "xargs npx semver | grep -F \"#{tag}\" -B 1 | head -n 1",
                     print_command: false,
                     print_command_output: false)).strip
        else
          ## Release mode
          title = "Release #{tag}"
          prev = (sh("git tag | grep -E \"^[0-9]+\\.[0-9]+\\.[0-9]+$\" | " +
                     "xargs npx semver | grep -F \"#{tag}\" -B 1 | head -n 1",
                     print_command: false,
                     print_command_output: false)).strip
        end
        if tag == prev || ! prev
          sh "git tag"
          UI.user_error! "Couldn't find previous tag prior to #{tag}."
        end
        UI.message("Using '#{prev}' as previous release.")
        FileUtils.mkdir_p("release/#{tag}")
        File.write("release/#{tag}/CHANGELOG", "#{title}")
        sh("gitchangelog \"#{prev}\"..\"#{tag}\" | tail -n +2 >> \"release/#{tag}/CHANGELOG\"",
           print_command_output: false)
        sh "cat \"release/#{tag}/CHANGELOG\""
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Generate changelog in release/TAG/CHANGELOG from the last version to the current one"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(
            key: :tag,
            env_name: "FL_ANDROID_GEN_VERSION_CODE_FOR_TAG_TAG",
            description: "Tag for which to generate changelog",
            default_value: false
          ),
        ]
      end

      def self.output
        []
      end

      def self.return_value
        "Returns the content of the changelog"
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
