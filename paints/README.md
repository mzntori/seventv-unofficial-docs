# Table of Contents

1. [Paints](#1-paints)
    1. [Tools](#11-tools)
    2. [Fetching paints](#12-fetching-paints)
        1. [Requesting all paints](#121-requesting-all-paints)
        2. [Requesting specific paints](#122-requesting-specific-paints)
        3. [Getting Cosmetic IDs](#123-getting-cosmetic-ids)
            1. [All User Cosmetics](#1231-all-user-cosmetics)
            2. [Only active paint](#1232-only-active-paint)
            3. [Making a full paint request](#1233-making-a-full-paint-request)
    3. [Rendering paints using CSS](#13-rendering-paints-using-css)
        1. [color](#131-color)
        2. [Gradients](#132-gradients)
            1. [Linear gradients](#1321-linear-gradients)
            2. [Repeating linear gradients](#1322-repeating-linear-gradients)
            3. [Radial gradients](#1323-radial-gradients)
            4. [Repeating radial gradients](#1324-repeating-radial-gradients)
        3. [URL backgrounds](#133-url-backgrounds)
        4. [Shadows](#134-shadows)
            1. [Accounting for font size](#1341-accounting-for-font-size)
2. [Conclusion](#2-conclusion)

# 1. Paints

Paints are a 7TV cosmetic that allow a user to customize their username in Twitch and Kick chatrooms.
However, 7TVs [GQL API](https://7tv.io/v3/gql) allows developers to fetch these paints for each user and apply them to
their own applications (e.g. this [vanity tool](https://vanity.zonian.dev/)).

These docs aim to help with getting relevant data for displaying these paints and also provide reference on how to
display paints using CSS. Also note that these docs only work with v3 of the API, if v4 is released, and you read this,
this is not up to date.

## 1.1 Tools

***GQL***: I use this tool to test GQL queries and i can recommend it: 
[Hasura Graphiql](https://cloud.hasura.io/public/graphiql?endpoint=https://7tv.io/v3/gql).

## 1.2 Fetching paints

Paints can be fetched using the [GQL API](https://7tv.io/v3/gql).
You can use [this](https://cloud.hasura.io/public/graphiql?endpoint=https://7tv.io/v3/gql) tool to generate queries
easily for testing.

Since GQL allows you to only request certain parts of the schema the exact return value will depend on the fields you
requested.
What fields are used for what will be explained later, but I recommend requesting all fields in general.
For now, I will only request the ID and the Name of the paints to make the examples easier to read.

### 1.2.1 Requesting all paints

One way to request paints is to request all current paints 7TV provides.

```
query GetAllPaints {
  cosmetics {
    paints {
      name
      id
    }
  }
}
```

returns:

```json
{
  "data": {
    "cosmetics": {
      "paints": [
        {
          "name": "Candy Cane",
          "id": "61bede3db6b41ea54419bbb0"
        },
        {
          "name": "Tinsel",
          "id": "61bedf64b6b41ea54419bbb1"
        },
        // ...
        {
          "name": "Elements Test",
          "id": "66de0267f4cb2a3b65abd35f"
        }
      ]
    }
  }
}
```

### 1.2.2 Requesting specific paints

What, however if you only want one or a few selected paints?
To select a list of paints you can provide them in the `list` parameter.
`list` takes an array of object IDs.

Here we request just the `Candy Cane` and the `Tinsel` paints we already got in the example above:

```
query GetOnePaint {
  cosmetics(list: ["61bede3db6b41ea54419bbb0", "61bedf64b6b41ea54419bbb1"]) {
    paints {
      name
      id
    }
  }
}

```

returns:

```json
{
  "data": {
    "cosmetics": {
      "paints": [
        {
          "name": "Candy Cane",
          "id": "61bede3db6b41ea54419bbb0"
        },
        {
          "name": "Tinsel",
          "id": "61bedf64b6b41ea54419bbb1"
        }
      ]
    }
  }
}
```

### 1.2.3 Getting Cosmetic IDs

Of course just getting the paint data will probably not be enough for most applications.

#### 1.2.3.1 All User Cosmetics

To get all cosmetics a user owns you can use the following query:

```
query GetUserPaints {
  user(id: "6116bc79446a415801b1b70d") {
    cosmetics {
      id
      kind
      selected
    }
  }
}
```

returns something like:

```json
{
  "data": {
    "user": {
      "cosmetics": [
        {
          "id": "62f98190e46eb00e438a6970",
          "kind": "BADGE",
          "selected": false
        },
        {
          "id": "62f97c05e46eb00e438a696a",
          "kind": "BADGE",
          "selected": false
        },
        {
          "id": "62f99d0ce46eb00e438a6984",
          "kind": "BADGE",
          "selected": true
        },
        {
          "id": "66bfcd890d8502f0629f9bc8",
          "kind": "PAINT",
          "selected": true
        },
        {
          "id": "66d2fde925894bf4022fd6cb",
          "kind": "PAINT",
          "selected": false
        }
      ]
    }
  }
}
```

As you can see this returns all badges and paints someone owns, paints of kind `"PAINT"`, badges of kind `"BADGE"`.
The selected badge and paint have the `selected` field set to `true`.

Alternatively if you want to get this list using a platform-specific id like Twitch IDs `userByConnection` can be used:

```
query GetUserPaints {
  userByConnection(id: "135078647", platform: TWITCH) {
    cosmetics {
      id
      kind
      selected
    }
  }
}
```

From here on out you can use the `cosmetics` field to get the full paint data.

#### 1.2.3.2 Only active paint

If you only need the paint the user is currently using you can get that through the `style/paint` field.
This saves you an extra request and some filtering.

```
query GetUserPaints {
  userByConnection(id: "135078647", platform: TWITCH) {
    style {
      paint {
        name
        id
      }
    }
  }
}
```

returns something like (again only including `name` and `id` but this `paint` field contains all information you would
get from the `cosmetics` field):

```json
{
  "data": {
    "userByConnection": {
      "style": {
        "paint": {
          "name": "Eggpire",
          "id": "66bfcd890d8502f0629f9bc8"
        }
      }
    }
  }
}
```

#### 1.2.3.3 Making a full paint request

To properly render a paint you need to request (almost) all fields of a paint.
As of writing `gradients`, which is just another way of passing fields like `angle` or `function` that exist outside of
it, is an unused field and only the fields outside of it get used to describe the background.
`gradients` provides a way of having multiple gradients per paint in theory, but the extension internally also just uses
the first one in the array, and it doesn't get in any paint, so I will just ignore it assuming it will not be used in
the future.
The

Here we request the `Candy Cane` paint.

```
query GetAllFields {
  cosmetics(list: ["61bede3db6b41ea54419bbb0"]) {
    paints {
      name
      id
      angle
      color
      flairs { data height kind x_offset width y_offset }
      function
      gradients {
        angle
        at
        canvas_repeat
        function
        image_url
        repeat
        shape
        size
        stops { at color center_at }
      }
      image_url
      kind
      repeat
      shadows { color radius x_offset y_offset }
      shape
      stops { center_at at color }
      text {
        shadows { color radius x_offset y_offset }
        stroke { color width }
        transform
        variant
        weight
      }
    }
  }
}
```

returns:

```json
{
  "data": {
    "cosmetics": {
      "paints": [
        {
          "name": "Candy Cane",
          "id": "61bede3db6b41ea54419bbb0",
          "angle": 45,
          "color": -10197761,
          "flairs": [],
          "function": "LINEAR_GRADIENT",
          "gradients": [],
          "image_url": null,
          "kind": "",
          "repeat": true,
          "shadows": [
            {
              "color": 102,
              "radius": 0.7,
              "x_offset": -1,
              "y_offset": 0
            },
            {
              "color": 102,
              "radius": 0.7,
              "x_offset": 1,
              "y_offset": 0
            },
            {
              "color": 102,
              "radius": 0.7,
              "x_offset": 0,
              "y_offset": -1
            },
            {
              "color": 102,
              "radius": 0.7,
              "x_offset": 0,
              "y_offset": 1
            }
          ],
          "shape": null,
          "stops": [
            {
              "center_at": null,
              "at": 0.1,
              "color": -757935361
            },
            {
              "center_at": null,
              "at": 0.2,
              "color": -757935361
            },
            {
              "center_at": null,
              "at": 0.2,
              "color": -10197761
            },
            {
              "center_at": null,
              "at": 0.3,
              "color": -10197761
            }
          ],
          "text": null
        }
      ]
    }
  }
}
```

## 1.3 Rendering paints using CSS

This part is about rendering paints in CSS.
Other rendering engines may or may not work in similar ways however paints are probably mostly rendered in web apps.

The style examples used here are showcased in an [HTML file](./paints.html) and can be found using the example numbers.
Any js code segments are also in a seperate [js file](./paints.js).

Additionally, there is an example on how to generate css for a paint from its ID [here](./example.js).
It generates the paint for the last example in the HTML file.
You can change the paint by inserting another ID in the second line of [example.js].
If you want to use it you can clone this repo and just open the html file in any browser.

### 1.3.1 color

Each paint may provide a base RGBA color returned in the `color` field encoded as an unsigned integer.
The 8 MSBs represent the red value, the next 8 the green, the next 8 the blue and finally the 8 LSBs the alpha value.

To convert this integer into the css value we need, we can use a function similar to the following:

```js
// Code from offical 7TV repo https://github.com/SevenTV/Extension/blob/cc924cbf4483a5436732526418d16002a6e7a6d1/src/common/Color.ts#L3
const decimalToRGBAString = (num) => {
    const r = (num >>> 24) & 0xff;
    const g = (num >>> 16) & 0xff;
    const b = (num >>> 8) & 0xff;
    const a = num & 0xff;

    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}
```

In the example of the `Candy Pane (61bede3db6b41ea54419bbb0)` paint we get an integer value of `-10197761` which
converts to
`rgba(255, 100, 100, 1.000)`.

```css
/*Example 1.1*/
.color-example {
    color: rgba(255, 100, 100, 1.000);
}
```

If the `color` field is `null` the color gets inherited from the users regular twitch color.

```css
.color-example {
    color: inherit;
}
```

However, if we leave it like this, if we get a color that is non-transparent it will actually be rendered above the
gradients we are about to add.
To fix that we can add two extra tags that fixes that (honestly IDK how it works but the extension does it like that).

```css
.color-example {
    color: rgba(255, 100, 100, 1.000);
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

Applying it like this will not work but as soon as we add the `background-image` tag in the next chapters this will fix
itself.

### 1.3.2 Gradients

A lot of paints rely on gradients for their coloring.
These are achieved using the `background-image` CSS tag.
There are a few different types of gradients.

#### 1.3.2.1 Linear gradients

A paint uses a linear gradient when the `function` field is set to `"LINEAR_GRADIENT"` like in our `Candy Cane` example.
Other value for this field are `RADIAL_GRADIENT` or `URL`.

To get the stops for this gradient we can take a look at the `stops` field, which is an Array of stops.
Each stop provides an RGB color encoded as an unsigned integer and the position it should be positioned at.
The `center_at` field doesn't get used by the extension currently, so I'm not sure how to use that.

```json
{
  "center_at": null,
  "at": 0.2,
  "color": -757935361
}
// turns into rgb(210, 210, 210) 20%
```

The conversion from integer to RGB value is the same as the conversion to RGBA except the alpha is ignored.

```js
const decimalToRGBString = (num) => {
    const r = (num >>> 24) & 0xff;
    const g = (num >>> 16) & 0xff;
    const b = (num >>> 8) & 0xff;

    return `rgb(${r}, ${g}, ${b})`;
}
```

Additionally, the `angle` field provides an angle for linear gradients.
In the example of `Candy Cane` that angle is 45 degrees.

```css
.linear-gradient-example {
    color: rgba(255, 100, 100, 0.000);
    background-image: linear-gradient(45deg, rgb(210, 210, 210) 10%, rgb(210, 210, 210) 20%, rgb(255, 100, 100) 20%, rgb(255, 100, 100) 30%);;
    background-size: 100% 100%;
    background-clip: text;
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

To properly render the gradient over the text you also have to set `background-clip` to `text` and the `background-size`
to `100% 100%`.

However, this will not to render the gradient properly in the case of `Candy Cane`.
As you might notice there is only one stripe.

#### 1.3.2.2 Repeating linear gradients

Every paint has a field `repeat`.
If it is set to `true` the `linear-gradient` converts into a `repeating-linear-gradient`.

```css
.repeating-linear-gradient-example {
    color: rgba(255, 100, 100, 1.000);
    background-image: repeating-linear-gradient(45deg, rgb(210, 210, 210) 10%, rgb(210, 210, 210) 20%, rgb(255, 100, 100) 20%, rgb(255, 100, 100) 30%);;
    background-size: 100% 100%;
    background-clip: text;
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

#### 1.3.2.3 Radial gradients

Radial gradients work similar to linear gradients, however instead of an `angle` a `shape` may be provided.
If shape is `null` you should default to `"circle"`.
Stops work the exact same way.

For the paint `Solar Flare (62dc3339911f10b7fced2f6c)` this looks something like this:

```css
.radial-gradient-example {
    color: inherit;
    background-image: radial-gradient(ellipse, rgb(255, 211, 92) 72%, rgb(255, 136, 0) 87%, rgb(245, 122, 41) 88%, rgb(249, 218, 134) 95%);
    background-size: 100% 100%;
    background-clip: text;
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

Now, that does not render the paint properly.

#### 1.3.2.4 Repeating radial gradients

Again, like with linear gradients, whenever the `repeat` field is `true` we need to use a repeating radiant.

```css
.repeating-radial-gradient-example {
    color: inherit;
    background-image: repeating-radial-gradient(ellipse, rgb(255, 211, 92) 72%, rgb(255, 136, 0) 87%, rgb(245, 122, 41) 88%, rgb(249, 218, 134) 95%);
    background-size: 100% 100%;
    background-clip: text;
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

### 1.3.3 URL backgrounds

Next to linear and radial gradients there is a third way a background can be colored and that is per url.
The `function` field will be `"URL"` in this case.

If this is the case the `image_url` field should contain a string with an url that can be applied as a background image.
In this example the `Eggpire (66bfcd890d8502f0629f9bc8)` paint.

```css
.url-background-example {
    color: rgba(0, 0, 0, 0.000);
    background-image: url("https://cdn.7tv.app/emote/66bfd747c66164d0fc0bc31e/1x.webp");
    background-size: 100% 100%;
    background-clip: text;
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

If no url is provided the url function will receive an empty string, which results in `color` being used.
Be aware that some paints (like `Eggpire`) have a fully transparent color underneath which in theory could lead to
invisible usernames.

### 1.3.4 Shadows

A lot of paints also have shadows.
Data about shadows can be found under the `shadows` field.
Each paint can have multiple shadows, where the order of applying does not matter.

For the `Eggpire` paint the `shadows` field has the following value:

```json
[
  {
    "color": -545143041,
    "radius": 0.1,
    "x_offset": 0,
    "y_offset": 0
  },
  {
    "color": 1879074815,
    "radius": 0.1,
    "x_offset": 1,
    "y_offset": 1
  }
]
```

This means there are two drop-shadows to apply.
The first one has `color` of `-545143041` which is equivalent to `rgba(223, 129, 198, 1.000)` after using our
`decimalToRGBAString` function.
It does not have any offset, and it only has a radius of 0.1px which is how "far" it blurs away from the text.

We apply these using the `filter` property.
As values, we have a " "-seperated list of `drop-shadows`.

```css
.shadows-example {
    color: rgba(0, 0, 0, 0.000);
    background-image: url("https://cdn.7tv.app/emote/66bfd747c66164d0fc0bc31e/1x.webp");
    background-size: 100% 100%;
    background-clip: text;
    filter: drop-shadow(0px 0px 0.1px rgba(223, 129, 198, 1.000)) drop-shadow(1px 1px 0.1px rgba(112, 0, 103, 1.000));
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

A simple function that formats a drop-shadow for us could look something like this:

```js
const createDropShadow = (x_offset, y_offset, radius, color) => {
    return `drop-shadow(${x_offset}px ${y_offset}px ${radius}px ${decimalToRGBAString(color)})`
}
```

#### 1.3.4.1 Accounting for font size

I don't think any official 7TV application does this, so this is just a personal opinion, but if your application has
large text that gets "painted" you
could consider using `rem` instead of `px` here because having `px` based shadows on large fonts may make them basically
invisible.
If you do this you will probably have to convert the values into fitting values for `rem`.

In this example i divided the offsets by 10.

```css
.shadows-using-rem-example {
    color: rgba(0, 0, 0, 0.000);
    background-image: url("https://cdn.7tv.app/emote/66bfd747c66164d0fc0bc31e/1x.webp");
    background-size: 100% 100%;
    background-clip: text;
    filter: drop-shadow(0rem 0rem 0.1rem rgba(223, 129, 198, 1.000)) drop-shadow(0.1rem 0.1rem 0.1rem rgba(112, 0, 103, 1.000));
    background-color: currentColor;
    -webkit-text-fill-color: transparent;
}
```

# 2 Conclusion

This concludes all currently used fields in paints.
There are some others like `text` which allows to change things like font weight, but it is not in use in any paint
currently.
