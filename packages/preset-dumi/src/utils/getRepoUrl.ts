import hostedGit from 'hosted-git-info';

export default (url: any, platform?: 'gitlab') => {
  if (!url || typeof(url) !== 'string') return '';

  let repoUrl = hostedGit.fromUrl(url)?.browse();

  if (!repoUrl) {
    const isHttpProtocol = url.includes('http://');

    if (platform === 'gitlab') {
      if (isHttpProtocol) url = url.replace('http', 'https');

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
    repoUrl =
      repoUrl || url.replace(/^.*?((?:[\w-]+\.?)+)+[:/]([\w-]+)\/([\w-]+).*$/, 'https://$1/$2/$3');

    if (isHttpProtocol) repoUrl = repoUrl.replace('https', 'http');
  }

  return repoUrl;
};
