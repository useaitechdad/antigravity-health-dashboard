/*
 * Copyright 2026 Use AI with Tech Dad
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * NOTICE: This file has been modified by Use AI with Tech Dad for the Antigravity series.
 */

/**
 * Utility for calculating SVG arc paths for gauges.
 * Pure math, no dependencies.
 */

export interface ArcParams {
    centerX: number;
    centerY: number;
    radius: number;
    startAngle: number; // In degrees
    endAngle: number;   // In degrees
}

/**
 * Generates an SVG path string for a circular arc.
 * Angles follow standard mathematical convention: 0 is right, 90 is up (positive Y is up in math).
 * Note: SVG Y increases downwards, so we negate the sin component.
 */
export function getArcPath(params: ArcParams): string {
    const { centerX, centerY, radius, startAngle, endAngle } = params;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY - radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY - radius * Math.sin(endRad);

    // Large arc flag: 1 if sweep is > 180 degrees
    const sweep = Math.abs(endAngle - startAngle);
    const largeArcFlag = sweep > 180 ? 1 : 0;

    // Sweep flag: 0 for counter-clockwise, 1 for clockwise
    // In our case (195 -> -15), it is clockwise sweep
    const sweepFlag = 1;

    return `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX.toFixed(2)} ${endY.toFixed(2)}`;
}

/**
 * Calculates the length of a circular arc.
 */
export function getArcLength(radius: number, sweepAngle: number): number {
    return (Math.abs(sweepAngle) / 360) * 2 * Math.PI * radius;
}
