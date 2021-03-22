import hostedGit from 'hosted-git-info';

export default (url: string, platform?: 'gitlab') => {
  let repoUrl = hostedGit.fromUrl(url)?.browse();

  if (!repoUrl && url) {
    if (platform === 'gitlab') {
      let originalHost: string;

      repoUrl = hostedGit
        .fromUrl(
          // fake to gitlab to make hostedGit worked
          // refer: https://github.com/npm/hosted-git-info/pull/30#issuecomment-400074956
          url.replace(/([\w-]+\.)+[\w-]+/, str => {
            originalHost = str;

            return 'gitlab.com';
          }),
        )
        ?.browse()
        // restore the original host
        ?.replace('gitlab.com', originalHost);
    }

    // process other case, protocol://domain/group/repo{discard remaining paths}
    const protocol = url.includes('http://') ? 'http' : 'https';
    repoUrl =
      repoUrl || url.replace(/^.*?((?:[\w-]+\.?)+)+[:/]([\w-]+)\/([\w-]+).*$/, `${protocol}://$1/$2/$3`);
  }

  return repoUrl;
};
