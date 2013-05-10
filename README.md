NGJS
====

Gallery using
  * [Node.js](http://nodejs.org) as main programming language
  * [Express.js](http://expressjs.com) for the web server application framework
  * [Jade](http://jade-lang.com) for the template engine
  * [Angular.js](http://angularjs.org) for the client application framework
  * [Less](http://lesscss.org) as CSS preprocessor

I use a few other dependencies including:
  * [Zigfy](http://github.com/xionluhnis/zigfy) - my own JQuery plugin for gallery creation
  * [Less Elements](http://lesselements.com/) - set of mixins for CSS3 with *Less*
  * [Node OpenID](https://github.com/havard/node-openid) - openid verification for Node.js
  * [Node Markdown](https://github.com/andris9/node-markdown) - Markdown parser for Node.js

REST API
========
  * `/rest/index` - index-related data
    * GET: list of subdirectories and a random list of images taken from the underlying galleries
    * POST: create a specific path (all corresponding directories which are not available yet)
    * PUT: set index order and related data (from GET)
    * DELETE: remove an empty index
  * `/rest/gallery` - gallery-related data
    * GET: list of images and their thumbnails (possibly other-related information in the future)
    * POST: create a gallery skeleton (directories) or *image actions*
    * PUT: upload gallery files (images, archives) or *image actions*
    * DELETE: remove parts of (or a whole) gallery
  * `/rest/metadata` - description data-related
    * GET: get a metadata file content
    * POST: ???
    * PUT: update the content of a metadata file
    * DELETE: remove a metadata file (implicitly done when the content of PUT is empty)

Image actions
=============
  * resize
  * exif edit
  * auto-orient (for browsers)
  * "image archives" stored as if or extracted as full gallery
  * filters (maybe?)

I'm currently thinking of which library for that, the one which retained my attention are:
  * [node-easyimage](https://github.com/hacksparrow/node-easyimage) which is basically a wrapper on ImageMagick shell commands
  * [exiv2-node](https://github.com/dberesford/exiv2node) for exif data, but here again, I could simply use exiftools commands
  * [gm](https://github.com/aheckmann/gm) for full image edition / filtering, but I don't know how much ImageMagick would be enough given that it is basically made for GraphicsMagick

I'll probably go for whichever by having a layer of abstraction between the image actions and their implementation so that one can choose what implementation he wants.

Authentication
==============
The authentication for any non-get action is made in `routes/auth.js` which simply uses OpenID.

The OpenID service is not shipped with NGJS. I personally use PHP [SimpleID](http://sourceforge.net/projects/simpleid/).

The current identity verification is made with [node-openid](https://github.com/havard/node-openid). Another great solution seems to be [everyauth](https://github.com/bnoguchi/everyauth), which I may include, but it seems really overkill for what I wanted, especially since I only thought of the gallery as a single-author website, not a multi-author one.

Already done
============
REST API:
  * `/rest/index` - **GET** subdirectories and their type (see general uses of `routes/router.js`), as well as random images from underlying galleries, and **POST** to create new indexes
  * `/rest/gallery` - **GET** gallery images (no thumbnails yet)
  * `/rest/metadata` - **GET**, **PUT** and **DELETE** (*POST* is not yet planned), so it's done!
Edition:
  * Inline text metadata edition and update

Roadmap
=======
  * Implement **index** deletion
  * Implement **gallery** creation, image upload and deletion
  * Implement **gallery** archives upload, linking and extraction
  * Implement **gallery** image manipulation (resize, auto-orient)
  * Remove Redis dependency by using simple Cookie sessions (why relying on redis if we don't really need it? Less is more.)

That's it for now.
