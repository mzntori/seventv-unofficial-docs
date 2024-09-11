// Code from offical 7TV repo https://github.com/SevenTV/Extension/blob/cc924cbf4483a5436732526418d16002a6e7a6d1/src/common/Color.ts#L3
const decimalToRGBAString = (num) => {
    const r = (num >>> 24) & 0xff;
    const g = (num >>> 16) & 0xff;
    const b = (num >>> 8) & 0xff;
    const a = num & 0xff;

    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

const decimalToRGBString = (num) => {
    const r = (num >>> 24) & 0xff;
    const g = (num >>> 16) & 0xff;
    const b = (num >>> 8) & 0xff;

    return `rgba(${r}, ${g}, ${b})`;
}

const createDropShadow = (x_offset, y_offset, radius, color) => {
    return `drop-shadow(${x_offset}px ${y_offset}px ${radius}px ${decimalToRGBAString(color)})`
}