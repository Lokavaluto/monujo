require 'fileutils'
require 'shellwords'
require 'tmpdir'


module Fastlane
  module Actions
    module SharedValues
      SCREENSHOT_BROWSER_PATH = :SCREENSHOT_BROWSER_PATH
    end

    ## Screenshots need a headless Chrome that honors ``--window-size``.
    ## Since Chrome 132, the regular Chrome binary only has the "new"
    ## headless mode, which ignores the requested window height: Cypress
    ## then captures a page taller than the window by stitching several
    ## scrolled captures, and part of the page gets repeated at the
    ## bottom of the screenshot. The "old" headless mode now ships
    ## separately as ``chrome-headless-shell``, released alongside each
    ## Chrome version.
    class ScreenshotBrowserAction < Action
      CHROME_HEADLESS_SHELL_VERSION = "156.0.8078.80"

      CHROME_FOR_TESTING_URL = "https://storage.googleapis.com/chrome-for-testing-public"

      ## ``uname -s``/``uname -m`` to Chrome for Testing platform name
      CHROME_FOR_TESTING_PLATFORMS = {
        ["Linux", "x86_64"] => "linux64",
        ["Darwin", "arm64"] => "mac-arm64",
        ["Darwin", "x86_64"] => "mac-x64",
      }

      def self.run(params)
        version = params[:version]
        platform = chrome_for_testing_platform
        install_dir = cache_dir(version, platform)
        binary = binary_path(install_dir, platform)

        if File.exist?(install_dir)
          error = version_error(binary, version)
          if error
            UI.user_error!(
              "Cached 'chrome-headless-shell' in '#{install_dir}' is unusable: #{error}\n" +
              "  Remove this directory and run again to reinstall it."
            )
          end
          UI.message "Using cached 'chrome-headless-shell' #{version} in '#{install_dir}'"
        else
          install(install_dir, version, platform)
        end

        wrapper = File.join(install_dir, "google-chrome")
        write_wrapper(wrapper, wrapper_content(binary, version))
        UI.message "Screenshot browser: #{wrapper}"
        Actions.lane_context[SharedValues::SCREENSHOT_BROWSER_PATH] = wrapper
        wrapper
      end

      def self.chrome_for_testing_platform
        os = `uname -s`.strip
        arch = `uname -m`.strip
        platform = CHROME_FOR_TESTING_PLATFORMS[[os, arch]]
        if ! platform
          UI.user_error!(
            "No 'chrome-headless-shell' available for #{os} #{arch}.\n" +
            "  Supported: " +
            CHROME_FOR_TESTING_PLATFORMS.keys.map { |k| k.join(" ") }.join(", ")
          )
        end
        platform
      end

      def self.cache_dir(version, platform)
        cache_root = ENV["XDG_CACHE_HOME"]
        if cache_root.nil? || cache_root.empty?
          cache_root = File.join(Dir.home, ".cache")
        end
        File.join(cache_root, "monujo", "chrome-headless-shell", "#{version}-#{platform}")
      end

      def self.binary_path(install_dir, platform)
        File.join(install_dir, "chrome-headless-shell-#{platform}", "chrome-headless-shell")
      end

      ## Return nil if binary reports given version, an error message otherwise.
      def self.version_error(binary, version)
        if ! File.executable?(binary)
          return "'#{binary}' is missing or not executable."
        end
        output = `#{Shellwords.escape(binary)} --version 2>&1`.strip
        if ! $?.success?
          return "'#{binary} --version' failed: #{output}"
        end
        if ! output.match?(/(^|\s)#{Regexp.escape(version)}$/)
          return "'#{binary} --version' answered '#{output}', expected version #{version}."
        end
        nil
      end

      def self.install(install_dir, version, platform)
        url = "#{CHROME_FOR_TESTING_URL}/#{version}/#{platform}/chrome-headless-shell-#{platform}.zip"
        parent = File.dirname(install_dir)
        FileUtils.mkdir_p(parent)
        ## Staging directory on the same filesystem, so the final rename
        ## is atomic and an interrupted install never leaves a
        ## half-installed browser.
        staging = Dir.mktmpdir(".staging-", parent)
        begin
          zip_path = File.join(staging, "chrome-headless-shell.zip")
          UI.message "Downloading 'chrome-headless-shell' #{version} for #{platform} from #{url}"
          Actions.sh("curl", "-fSL", "--retry", "3", "-o", zip_path, url)
          ## ``unzip`` keeps the executable bits that the browser needs.
          Actions.sh("unzip", "-q", zip_path, "-d", staging)
          File.delete(zip_path)
          error = version_error(binary_path(staging, platform), version)
          if error
            UI.user_error!("Downloaded 'chrome-headless-shell' is unusable: #{error}")
          end
          File.rename(staging, install_dir)
        ensure
          FileUtils.rm_rf(staging) if File.exist?(staging)
        end
      end

      ## Cypress 13 does not recognise the "Google Chrome for Testing
      ## <version>" answer of ``chrome-headless-shell --version``, so the
      ## wrapper answers as Google Chrome. On Linux, the browser needs
      ## ``--no-sandbox``: distributions restricting unprivileged user
      ## namespaces (Ubuntu 23.10+) only grant the Chrome sandbox to the
      ## installed Google Chrome.
      def self.wrapper_content(binary, version)
        extra_args = `uname -s`.strip == "Linux" ? " --no-sandbox" : ""
        <<~EOF
          #!/bin/sh
          ## Generated by monujo fastlane action 'screenshot_browser'.
          if [ "$1" = "--version" ]; then
              echo "Google Chrome #{version}"
              exit 0
          fi
          exec #{Shellwords.escape(binary)}#{extra_args} "$@"
        EOF
      end

      def self.write_wrapper(wrapper, content)
        return if File.exist?(wrapper) && File.read(wrapper) == content
        tmp = "#{wrapper}.tmp-#{Process.pid}"
        File.write(tmp, content)
        File.chmod(0755, tmp)
        File.rename(tmp, wrapper)
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        "Install (once) a pinned 'chrome-headless-shell' and return the path " +
          "of a wrapper to give to 'cypress run --browser'"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :version,
                                       env_name: "FL_SCREENSHOT_BROWSER_VERSION",
                                       description: "Chrome for Testing version of 'chrome-headless-shell'",
                                       default_value: CHROME_HEADLESS_SHELL_VERSION),
        ]
      end

      def self.output
        [
          ['SCREENSHOT_BROWSER_PATH', 'Path of the browser wrapper to give to cypress']
        ]
      end

      def self.return_value
        "Path of the browser wrapper to give to 'cypress run --browser'"
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
