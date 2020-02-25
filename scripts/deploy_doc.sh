
set -e
shopt -s extglob

TEMP_PATH="docs/.temp"

# build docs
npm run doc:build

# prepare deploy
mkdir $TEMP_PATH
cd $TEMP_PATH
git init
git pull git@github.com:umijs/dumi.git gh-pages
cp -r ../../dist/* .

# commit and push changes
git add -A
git commit --am -m "build: deploy documentation"
git push -f git@github.com:umijs/dumi.git master:gh-pages

# clean
cd -
rm -rf $TEMP_PATH
