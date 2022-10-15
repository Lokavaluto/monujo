#!/bin/sh

##
## You can download latest version of this file:
##  $ wget https://gist.github.com/vaab/9118087/raw -O autogen.sh
##  $ chmod +x autogen.sh
##

##
## Functions
##

exname="$(basename "$0")"
long_tag="[0-9]+\.[0-9]+(\.[0-9]+)?-[0-9]+-[0-9a-f]+"
short_tag="[0-9]+\.[0-9]+(\.[0-9]+)?"
get_short_tag="s/^($short_tag).*\$/\1/g"

get_path() { (
    IFS=:
    for d in $PATH; do
        filename="$d/$1"
        [ -f "$filename" -a -x "$filename" ] && {
            echo "$d/$1"
            return 0
        }
    done
    return 1
) }

print_exit() {
    echo "$@"
    exit 1
}

print_syntax_error() {
    [ "$*" ] ||    print_syntax_error "$FUNCNAME: no arguments"
    print_exit "${ERROR}script error:${NORMAL} $@" >&2
}

print_syntax_warning() {
    [ "$*" ] || print_syntax_error "$FUNCNAME: no arguments."
    [ "$exname" ] || print_syntax_error "$FUNCNAME: 'exname' var is null or not defined."
    echo "$exname: ${WARNING}script warning:${NORMAL} $@" >&2
}

print_error() {
    [ "$*" ] || print_syntax_warning "$FUNCNAME: no arguments."
    [ "$exname" ] || print_exit "$FUNCNAME: 'exname' var is null or not defined." >&2
    print_exit "$exname: ${ERROR}error:${NORMAL} $@" >&2
}

depends() {
    ## Avoid colliding with variables that are created with depends.
    local __i __tr __path __new_name
    __tr=$(get_path "tr")
    test "$__tr" ||
        die "dependency check: couldn't find 'tr' command."

    for __i in "$@"; do
        if ! __path=$(get_path "$__i"); then
            __new_name=$(echo "$__i" | "$__tr" '_' '-')
            if [ "$__new_name" != "$__i" ]; then
                depends "$__new_name"
            else

                print_error "dependency check: couldn't find '$__i' required command."
            fi
        else
            if ! test -z "$__path" ; then
                export "$(echo "$__i" | "$__tr" -- '- ' '__')"="$__path"
            fi
        fi
    done
}

die() {
    [ "$*" ] || print_syntax_warning "$FUNCNAME: no arguments."
    [ "$exname" ] || print_exit "$FUNCNAME: 'exname' var is null or not defined." >&2
    print_exit "$exname: ${ERROR}error:${NORMAL}" "$@" >&2
}

matches() {
   echo "$1" | "$grep" -E "^$2\$" >/dev/null 2>&1
}

get_current_git_date_timestamp() {
    "$git" show -s --pretty=format:%ct
}


dev_version_tag() {
    compat_date "$(get_current_git_date_timestamp)" "+%Y%m%d%H%M"
}


get_current_version() {

    version=$("$git" describe --tags)
    if matches "$version" "$short_tag"; then
        echo "$version"
    else
        version=$(echo "$version" | compat_sed "$get_short_tag")
        echo "${version}.dev$(dev_version_tag)"
    fi

}

get_release_changes() {
    local prev_tag

    prev_tag=$(git describe --tag --abbrev=0 HEAD^)
    cur_tag=$(git describe --tag --abbrev=0 HEAD)

    if [ "$prev_tag" = "$cur_tag" ]; then
        die "Error: HEAD and HEAD^ are not on different tags."
    fi

    if get_path gitchangelog >/dev/null; then
        gitchangelog "$prev_tag".."$cur_tag" | tail -n +4
        if [ "$?" != 0 ]; then
            die "Changelog NOT generated. An error occured while running \`\`gitchangelog\`\`." >&2
        fi
    else
        die "Changelog NOT generated because \`\`gitchangelog\`\` could not be found."
    fi

}


cook() {
    local filename="$1"
    echo "Cooking '$filename'."
    COOKING=1 awk '
/^#NOCOOK[[:space:]]*/ {
    while (((getline) > 0) && ! /^#ENDNOCOOK[[:space:]]*/) {}
    next
}
/^#COOK[[:space:]]*/ {
    block = ""
    while (((getline) > 0) && ! /^#ENDCOOK[[:space:]]*/)
        block = block "\n" substr($0,2)
    cmd = "python -c '\''import sys; exec(sys.stdin.read())'\''"
    print block | cmd
    close(cmd)

    next
}
// $0
' "$filename" > "$filename.tmp" &&
    mv "$filename.tmp" "$filename"
}


prepare_files() {

    version=$(get_current_version)
    short_version=$(echo "$version" | cut -f 1,2,3 -d ".")

    for file in $FILES; do
        if [ -e "$file" ]; then
            compat_sed_i "s#%%version%%#$version#g;
                          s#%%short-version%%#${short_version}#g;
                          s#%%name%%#${NAME}#g;
                          s#%%author%%#${AUTHOR}#g;
                          s#%%email%%#${EMAIL}#g;
                          s#%%author-email%%#${AUTHOR_EMAIL}#g;
                          s#%%description%%#${DESCRIPTION}#g" \
                      "$file"
        fi
    done

    for file in $COOKFILES; do
        if [ -e "$file" ]; then
            cook "$file"
        fi
    done

    echo "Version updated to $version."
}

##
## LOAD CONFIG
##

if [ -e ./.package ]; then
    . ./.package
else
    if [ -e ./.package.d/config ]; then
        . ./.package.d/config
    else
        echo "'./.package' or ' ./.package.d/config' file is missing."
        exit 1
    fi
fi

## list of files where %%version*%% macros are to be replaced:
if [ -z "$FILES" ]; then
    if [ -e "setup.py" ]; then
        FILES="setup.cfg setup.py CHANGELOG.rst"
    fi
    if [ -e "package.json" ]; then
        FILES="package.json CHANGELOG.md"
    fi
fi
[ -z "$NAME" ] && die "No \$NAME was defined in './.package' nor './.package.d/config'."


##
## CHECK DEPS
##

depends git grep

## BSD / GNU sed compatibility layer
if get_path sed >/dev/null; then
    if sed --version >/dev/null 2>&1; then  ## GNU
        compat_sed() { sed -r "$@"; }
        compat_sed_i() { sed -r -i "$@"; }
    else                                    ## BSD
        compat_sed() { sed -E "$@"; }
        compat_sed_i() { sed -E -i "" "$@"; }
    fi
else
    ## Look for ``gsed``
    if (get_path gsed && gsed --version) >/dev/null 2>&1; then
        compat_sed() { gsed -r "$@"; }
        compat_sed_i() { gsed -r -i "$@"; }
    else
        print_error "$exname: required GNU or BSD sed not found"
    fi
fi

## BSD / GNU date compatibility layer
if get_path date >/dev/null; then
    if date --version >/dev/null 2>&1 ; then  ## GNU
        compat_date() { date -d "@$1" "$2"; }
    else                                      ## BSD
        compat_date() { date -j -f %s "$1" "$2"; }
    fi
else
    if (get_path gdate && gdate --version) >/dev/null 2>&1; then
        compat_date() { gdate -d "@$1" "$2"; }
    else
        print_error "$exname: required GNU or BSD date not found"
    fi
fi

if ! "$git" describe --tags >/dev/null 2>&1; then
    die "Didn't find a git repository (or no tags found). " \
        "\`\`./autogen.sh\`\` uses git to create changelog and version information."
fi


##
## CODE
##

for script in .package.d/autogen.d/*.lib; do
    [ -e "$script" ] || continue
    if ! . "$script" 2>&1; then
        die "Failed to load \`\`$script\`\`."
        exit 1
    fi
done

while [ "$1" ]; do
    case "$1" in
        --get-release-changes) get_release_changes; exit $?;;
        --get-version) get_current_version; exit $?;;
        --get-name) echo "$NAME"; exit 0;;
        --*|-*) die "unknown option '$1'";;
        *) die "unknown argument '$1'";;
    esac
    shift
done


for script in .package.d/autogen.d/*.sh; do
    [ -e "$script" ] || continue
    echo "Running \`\`$script\`\`..."
    if . "$script" 2>&1 | compat_sed 's/^/  | /g'; then
        echo "  ..done ($script)"
    else
        echo "  ..failed ! ($script)"
        exit 1
    fi
done