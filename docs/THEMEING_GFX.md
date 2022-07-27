# Theming GFX

This guide should tackle how theming should be handled in GFX elements.

It is required to allow for different theming of graphical visualisations, in order to suit each different theme and topic of the broadcast.

## Theming of components

Usually, all GFX elements are in the form of a web resource, that can be rendered by any web browser (especially the OBS/vMix integrated ones). Usually, they are consisting of HTML, JavaScript and CSS files.
All of those files are provided by the GFX provider per default. They may just represent a graphical visualisation that the maintainer of the GFX provider likes and that could be more or less fitting in a lot of scenarios.

## Global theming overwrite

Usually you would want to set up one single theme that will then be used all across various GFX elements. This is where the global theming overwrite comes into play. It allows you to specify one single CSS file, in which you can
overwrite all the styling information from the CSS file that is provided by the component, and adapt the looks to the specific needs.

## For GFX providers

To make this thing work, it's always important that you wrap your whole GFX component in a class (e.g. using an HTML div element) that is specific to your plugin and GFX (we recommend to use the plugin name). For plugins that describe multiple
GFX elements, also describe what it is.

Example: The plugin "league-gfx" offers the views "Post Game Gold Graph" and "Post Game Gold Comparison".

The "Post Game Gold Graph" would be wrapped with the class "league-gfx-post-gold-graph".
The "Post Game Gold Comparison" would be wrapped with the class "league-gfx-gold-comparison".

This allows to specifically only change one component in the global CSS.

## For theme creators

If you want to create a theme, there are a few tricks and tipps:

- use CSS variables to define and apply things like colours, margins, borders, etc. https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- use the wrapper class if you only want to style a specific component, but set all things globally that you want to have set globally (e.g. fonts, colours).
