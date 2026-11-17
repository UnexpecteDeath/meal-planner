# plate

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Profile editing in Supabase

Apply the [profile editing migration](supabase/migrations/20261105000000_profile_edit.sql) for the existing `public.profiles` table, then apply the [avatar policies for the `images` bucket](supabase/migrations/20261105000001_images_avatar_policies.sql). The app uploads to `<user-id>/avatar`. The second migration also creates a private `images` bucket if it doesn't already exist. If `images` already exists, its visibility and settings are preserved.

### Email confirmation in Supabase

In **Authentication → URL Configuration**, set **Site URL** to the app's base URL. Add the exact URLs for `/` (sign-up) and `/profile/edit` (email changes) to **Redirect URLs**, including the origin and port you use locally (for example, `http://localhost:5173/` and `http://localhost:5173/profile/edit`). In the **Confirm signup** and **Change email address** templates, keep the link's `href` as `{{ .ConfirmationURL }}`.

With **Secure email change** enabled, open the confirmation links in both the current and new inbox. Open links in the browser that initiated the request so it can exchange the PKCE code for a session. The app shows whether confirmation succeeded, is waiting for the second link, or failed.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
