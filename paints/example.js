// Set this to ID of paint to render:
const renderPaintID = '6454e5b26b4d36df97db9a6d';

async function fetchPaint(paintID) {
    const getPaint = await fetch(
        "https://7tv.io/v3/gql",    // 7TV Gql endpoint
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({      // Building our Gql Request using out query
                operationName: "GetPaint",
                variables: {list: [String(paintID)]},
                query: getPaintQuery
            })
        }
    );

    const getPaintResult = await getPaint.json();

    return getPaintResult.data.cosmetics.paints[0];
}

const backgroundImage = (paint) => {
    let result = "url()";

    switch (paint.function) {
        case "LINEAR_GRADIENT": {
            result = paint.repeat ? "repeating-" : ""
            result += `linear-gradient(${linearGradientContent(paint)})`
            break
        }
        case "RADIAL_GRADIENT": {
            result = paint.repeat ? "repeating-" : ""
            result += `radial-gradient(${radialGradientContent(paint)})`
            break
        }
        case "URL": {
            result = `url(${urlContent(paint)})`
            break
        }
    }

    return result
}

const urlContent = (paint) => {
    return paint.image_url ?? ""
}

const linearGradientContent = (paint) => {
    let args = []

    args.push(`${paint.angle}deg`)
    for (let stop of paint.stops) {
        args.push(`${decimalToRGBAString(stop.color)} ${stop.at * 100}%`)
    }

    return args.join(", ")
}

const radialGradientContent = (paint) => {
    let args = []

    args.push(paint.shape ?? "circle")
    for (let stop of paint.stops) {
        args.push(`${decimalToRGBAString(stop.color)} ${stop.at * 100}%`)
    }

    return args.join(", ")
}

const dropShadows = (paint) => {
    let args = []

    for (let shadow of paint.shadows) {
        args.push(`drop-shadow(${shadow.x_offset}px ${shadow.y_offset}px ${shadow.radius}px ${decimalToRGBAString(shadow.color)})`)
    }

    return args.join(" ")
}

async function generateCSS(paintID) {
    const paint = await fetchPaint(paintID);
    let css = ""

    css += ".js-generated-example {\n";
    css += `    color: ${paint.color ? decimalToRGBAString(paint.color) : "inherit"};\n`;
    css += `    background-image: ${backgroundImage(paint)};\n`;
    css += `    background-size: 100% 100%;\n`;
    css += `    background-clip: text;\n`;
    css += `    filter: ${dropShadows(paint)};\n`;
    css += `    background-color: currentColor;\n`;
    css += `    -webkit-text-fill-color: transparent;\n`;
    css += "}\n";

    return css
}

const getPaintQuery = `
query GetPaint($list: [ObjectID!]) {
    cosmetics(list: $list) {
        paints {
            id
            name
            color
            function
            angle
            shape
            image_url
            repeat
            stops {
                at
                color
            }
            shadows {
                x_offset
                y_offset
                radius
                color
                __typename
            }
            __typename
        }
        __typename
    }
}`

const decimalToRGBAString = (num, transparent) => {
    const r = (num >>> 24) & 0xff;
    const g = (num >>> 16) & 0xff;
    const b = (num >>> 8) & 0xff;
    const a = num & 0xff;

    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

// Function to apply the CSS to the document
function applyCSS(css) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

// Apply the CSS when the document is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const css = await generateCSS(renderPaintID);
    applyCSS(css);
});