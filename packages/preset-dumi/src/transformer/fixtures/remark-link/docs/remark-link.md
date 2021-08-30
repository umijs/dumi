<!-- docs root dir -->
[](/test)
<a href="/test"></a>
[](./test.md)
<a href="./test.md"></a>
[](./test.md#header)
<a href="./test.md#header"></a>
[](./test.md?a=1&b=2#header)
<a href="./test.md?a=1&b=2#header"></a>
<!-- secondary dir -->
[](/a/test)
<a href="/a/test"></a>
[](./a/test.md)
<a href="./a/test.md"></a>
[](./a/test.md#header)
<a href="./a/test.md#header"></a>
<!-- default locales jump to zh-CN  -->
[](./a/test.zh-CN.md)
<a href="./a/test.zh-CN.md"></a>
[](./a/test.zh-CN.md#头部)
<a href="./a/test.zh-CN.md#头部"></a>
[](./a/test.zh-CN.md?a=1&b=2#头部)
<a href="./a/test.zh-CN.md?a=1&b=2#头部"></a>
<!-- target md file custom route -->
[](/nav/group/route)
<a href="/nav/group/route"></a>
[](./route.md)
<a href="./route.md"></a>
[](./route.md#anchor)
<a href="./route.md#anchor"></a>
<!-- external link -->
[External Link](https://d.umijs.org/some.md)
<a href="https://d.umijs.org/some.md">External Link</a>
<a href="./test"><img src="logo.png" /></a>
<a href="/a/test.md"><img src="./assets/logo.png" /></a>
<a href="/a/test.md?a=1&b=2#header"><img src="/public/logo.png" /></a>
<a href="https://d.umijs.org/some.md"><img src="https://d.umijs.org/public/logo.png" /></a>
<!-- invalid md link -->
[](../outer.md)
[](ethereal.md)