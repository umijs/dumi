
set -e
shopt -s extglob

TEMP_PATH="docs/.temp"

# build docs
npm run docs:build

# prepare deploy
mkdir $TEMP_PATH
cd $TEMP_PATH
git init
cp -r ../../dist/* .
# commit and push changes
git add .
git commit -m "build: deploy documentation"
git push -f https://github.com/xxx.git master:gh-pages

# clean
cd -
rm -rf $TEMP_PATH
