# Control menu generate

## Convention menu rules

Dumi's document menu is based on the routing structure. The nested relationship of routes will be resolved into menu groups by dumi. First, let's see how dumi identifies the routing structure

```bash
/                       # ungrouped
/guide                  # go into guide group
/guide/help             # go into guide group
/other                  # go into other group
/very/very/deep/child   # Attention, it will go into /very/very/deep group
```

Then the recognition result will be presented as follows:

- root
- guide
  - guide
  - help
- other
- very/very/deep
  - child

It's basically the same as expected, but there is a problem here: it is very strange to present `very/very/deep` as a group when there is only one subitem. In order to satisfy the the requirements of special scenarios (it does necessary to group single subitems indeed) and normal scenarios (omitting grouping), dumi has a setting:

**When the group title is consistent with the subroute title and there is only one subroute**, the item will not be presented as a group, just like the `other` group. But how do you configure group title? Please keep looking down.

### Group title

The default rule of generating group title is to take the route name of the group, and remove `/` and capitalize it. For example, if the route is `/guide/help`, dumi will remove the last segment of route which is `/help`, take `/guide` as a group title, and remove `/` and capitalize it to `Guide`.

If you want to control the group title in manual way, you can configurate it through [the frontmatter configrations of `group.title`](/config/frontmatter#grouptitle)

### Group path

The default rule of generating the group path is to remove the last segment of the route, and the previous segment will be used as the group path no matter how long it is. For example, if the route is `/very/very/deep/child`, then `very/very/deep` will be used as the group path.

If you want to control the group path in manual way, you can configurate it through [the frontmatter configrations of `group.path`](/config/frontmatter#grouppath)

### Group order

The default rule of group order is: firstly, compare the length of `path`, for example `/guide` must be in front of `/guide/help`, and then compare the ASCII of group name. For example, `Guide` must be in front of `Help`.

If you want to control the group order in manual way, you can configurate it through [the frontmatter configrations of `group.order`](/config/frontmatter#grouporder). The smaller the number, the more previous the rank will be.

## Configurate side menu

<Alert>Attention：only works in <code>site</code> mode for now </Alert>

If found that the convention cannot satisfy the requirements, you can **increment customize** the side menu through [`menus`](/config#menus)

```ts
// config/config.ts or .umirc.ts
export default {
  menus: {
    // You need to customize the path of the side menu. Non-configurated path will still use the configuration generated automatically
    '/guide': [
      {
        title: 'menu title',
        path: 'menu path(optional)',
        children: [
          // submenu item(optional)
          'guide/index.md', // corresponding markdown file, the path is recognized relative to resolve.includes
        ],
      },
    ],
    // If there are other languages, the language prefix should be added before the path, which should be consistent with the path in the locales configuration
    '/zh-CN/guide': [
      // same as above
    ],
  },
};
```
