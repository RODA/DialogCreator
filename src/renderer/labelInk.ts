export interface VisibleLabelLine {
    text: string;
    baseline: number;
}

export interface LabelInkMeasurement {
    top: number;
    bottom: number;
    height: number;
    offsetY: number;
}

export function normalizeLabelVAlign(value: unknown): 'top' | 'middle' | 'optical-middle' | 'bottom' {
    const alignment = String(value ?? '').trim().toLowerCase();
    if (alignment === 'middle' || alignment === 'optical-middle' || alignment === 'bottom') {
        return alignment;
    }
    return 'top';
}

/**
 * Measure the ink in the laid-out label, in CSS pixels relative to its box.
 * Supply the displayed text of each line (including any ellipsis), its
 * alphabetic baseline, and a canvas context configured with the label's font
 * and text settings. A positive offset moves the entire text block down.
 * Returns null for empty ink or unavailable metrics.
 */
export function measureLabelInk(
    context: Pick<CanvasRenderingContext2D, 'measureText'>,
    lines: readonly VisibleLabelLine[],
    boxHeight: number
): LabelInkMeasurement | null {
    if (!Number.isFinite(boxHeight) || boxHeight <= 0) {
        return null;
    }

    let top = Infinity;
    let bottom = -Infinity;

    for (const line of lines) {
        const { actualBoundingBoxAscent, actualBoundingBoxDescent } = context.measureText(line.text);
        const inkTop = line.baseline - actualBoundingBoxAscent;
        const inkBottom = line.baseline + actualBoundingBoxDescent;

        if (!Number.isFinite(inkTop) || !Number.isFinite(inkBottom)) {
            return null;
        }
        if (inkBottom <= inkTop) {
            continue;
        }

        top = Math.min(top, inkTop);
        bottom = Math.max(bottom, inkBottom);
    }

    if (bottom <= top) {
        return null;
    }

    return {
        top,
        bottom,
        height: bottom - top,
        offsetY: (boxHeight - top - bottom) / 2
    };
}

/** Read the browser's line breaks without moving or changing the live label. */
export function measureRenderedLabelInk(
    host: HTMLElement,
    text: HTMLElement,
    maxLines: number,
    boxHeight: number,
    hostTop: number
): LabelInkMeasurement | null {
    const source = text.textContent ?? '';
    if (!host.isConnected || !source.trim()) {
        return null;
    }

    const document = host.ownerDocument;
    const style = getComputedStyle(text);
    const hostStyle = getComputedStyle(host);
    const width = Number.parseFloat(hostStyle.width)
        - Number.parseFloat(hostStyle.paddingLeft) - Number.parseFloat(hostStyle.paddingRight);
    if (!Number.isFinite(width) || width <= 0) {
        return null;
    }
    const context = document.createElement('canvas').getContext('2d');
    if (!context) {
        return null;
    }
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.direction = style.direction === 'rtl' ? 'rtl' : 'ltr';
    context.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
    context.wordSpacing = style.wordSpacing === 'normal' ? '0px' : style.wordSpacing;

    const probe = document.createElement('div');
    Object.assign(probe.style, {
        position: 'fixed', left: '-100000px', top: '0', visibility: 'hidden',
        pointerEvents: 'none', boxSizing: 'border-box', width: hostStyle.width,
        padding: hostStyle.padding, font: style.font, lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing, wordSpacing: style.wordSpacing,
        direction: style.direction, whiteSpace: hostStyle.whiteSpace,
        wordBreak: hostStyle.wordBreak, overflowWrap: hostStyle.overflowWrap
    });
    const content = document.createTextNode(source);
    probe.appendChild(content);

    // A zero-height inline box sits on the baseline. Calibrate separately
    // so the marker cannot affect the label's line breaks or bidi order.
    const sample = document.createElement('span');
    sample.style.position = 'absolute';
    sample.style.whiteSpace = 'nowrap';
    const reference = document.createTextNode('M');
    const marker = document.createElement('span');
    Object.assign(marker.style, { display: 'inline-block', width: '0', height: '0' });
    sample.append(reference, marker);
    probe.appendChild(sample);
    document.body.appendChild(probe);

    try {
        const range = document.createRange();
        range.selectNode(reference);
        const baselineOffset = marker.getBoundingClientRect().top - range.getBoundingClientRect().top;
        const origin = probe.getBoundingClientRect().top;
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        const lines: VisibleLabelLine[] = [];
        let clipped = false;
        for (const { segment, index } of segmenter.segment(source)) {
            range.setStart(content, index);
            range.setEnd(content, index + segment.length);
            const rect = range.getBoundingClientRect();
            if (rect.width <= 0) {
                continue;
            }
            const baseline = rect.top - origin + baselineOffset + hostTop;
            const last = lines.at(-1);
            if (last && Math.abs(last.baseline - baseline) < 0.5) {
                last.text += segment;
            } else if (lines.length < maxLines) {
                lines.push({ text: segment, baseline });
            } else {
                clipped = true;
                break;
            }
        }

        const last = lines.at(-1);
        if (!last) {
            return null;
        }
        if (clipped || (hostStyle.textOverflow === 'ellipsis' && context.measureText(last.text).width > width)) {
            // CSS ellipsis is paint-only. Approximate its visible prefix using
            // the same font and width, without splitting a grapheme cluster.
            let visible = '';
            for (const { segment } of segmenter.segment(last.text)) {
                if (context.measureText(visible + segment + '…').width > width) {
                    break;
                }
                visible += segment;
            }
            last.text = visible.trimEnd() + '…';
        }
        return measureLabelInk(context, lines, boxHeight);
    } finally {
        probe.remove();
    }
}
