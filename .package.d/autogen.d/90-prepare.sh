# -*- mode: shell-script -*-

prepare_files
if [ "$?" != 0 ]; then
    print_error "Error while updating version information."
fi
