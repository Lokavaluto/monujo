
def tag2vc(tag, rev)
    unless /^(?<major>[0-9]+)\.(?<minor>[0-9]+)\.(?<patch>[0-9]+)(-rc.(?<rc>[0-9]+))?$/ =~ tag
      raise SyntaxError, "invalid tag format (expecting 'MM.mm.pp(-rc.RR)')"
    end

    major = major.to_i
    minor = minor.to_i
    patch = patch.to_i
    rc = rc.to_i  ## will default to 0 if not provided

    ## Sanity checks
    if rc > 0 and patch > 0
      raise SyntaxError, "Invalid rc upon a patch version"
    end

    if major >= 22
      raise SyntaxError, "Invalid major number (should be <= 21)"
    end

    if minor >= 99
      raise SyntaxError, "Invalid minor number (should be <= 98)"
    end

    if patch >= 99
      raise SyntaxError, "Invalid patch number (should be <= 98)"
    end

    ## modification before output
    if rc != 0
        patch = 99
        if minor == 0
            if major == 0
              raise SyntaxError, "Can't do a release candidate on 0.0"
            end
            major -= 1
            minor = 99
        else
          minor -= 1
        end
    end
    return sprintf("%02d%02d%02d%02d%02d", major, minor, patch, rc, rev).to_i
end


module Fastlane
  module Actions
    module SharedValues
      VERSION_CODE = :VERSION_CODE
    end

    class VersionCodeFromTagAction < Action
      def self.run(params)
        tag = params[:tag] || Actions.lane_context[SharedValues::VERSION_NAME]
        version_code = tag2vc(tag, params[:rev])
        Actions.lane_context[SharedValues::VERSION_CODE] = version_code
        version_code
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Generates an integer build number for a given tag in format X.Y.Z[-rc.R]."
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :tag,
                                       env_name: "FL_GEN_VERSION_CODE_FOR_TAG_TAG",
                                       description: "Git tag for which to generate the version code",
                                       default_value: false),
          FastlaneCore::ConfigItem.new(key: :rev,
                                       env_name: "FL_GEN_VERSION_CODE_FOR_TAG_REV",
                                       description: "Revision number of the given tag",
                                       type: Integer,
                                       default_value: 0),
        ]
      end

      def self.output
        [
          ['VERSION_CODE', 'Integer representing the current version']
        ]
      end

      def self.return_value
        "Returns android version code"
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
