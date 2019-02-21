// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

/**
 * A thin layer which translates WM events to tiling actions.
 */
class TilingController {
    private engine: TilingEngine;

    public constructor(engine: TilingEngine) {
        this.engine = engine;
    }

    public onScreenCountChanged(count: number): void {
        debugObj(() => ["onScreenCountChanged", {count}]);
        this.engine.updateScreenCount(count);
        this.engine.arrange();
    }

    public onScreenResized(screen: number): void {
        debugObj(() => ["onScreenResized", {screen}]);
        this.engine.arrange();
    }

    public onCurrentActivityChanged(activity: string): void {
        debugObj(() => ["onCurrentActivityChanged", {activity}]);
        this.engine.arrange();
    }

    public onCurrentDesktopChanged(desktop: number): void {
        debugObj(() => ["onCurrentDesktopChanged", {desktop}]);
        this.engine.arrange();
    }

    public onWindowAdded(window: Window): void {
        debugObj(() => ["onWindowAdded", {window}]);
        this.engine.manageClient(window);
        this.engine.arrange();
    }

    public onWindowRemoved(window: Window): void {
        debugObj(() => ["onWindowRemoved", {window}]);
        this.engine.unmanageClient(window);
        this.engine.arrange();
    }

    public onWindowMoveStart(window: Window): void {
        /* do nothing */
    }

    public onWindowMove(window: Window): void {
        /* do nothing */
    }

    public onWindowMoveOver(window: Window): void {
        debugObj(() => ["onWindowMoveOver", {window}]);
        if (window.tileable) {
            const diff = window.actualGeometry.subtract(window.geometry);
            const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);
            /* TODO: arbitrary constant */
            if (distance > 30) {
                window.floatGeometry = window.actualGeometry;
                window.float = true;
                this.engine.arrange();
            } else
                window.commit();
        }
    }

    public onWindowResizeStart(window: Window): void {
        /* do nothing */
    }

    public onWindowResize(window: Window): void {
        /* do nothing */
    }

    public onWindowResizeOver(window: Window): void {
        debugObj(() => ["onWindowResizeOver", {window}]);
        if (Config.mouseAdjustLayout && window.tileable) {
            this.engine.adjustLayout(window);
            this.engine.arrange();
        } else if (!Config.mouseAdjustLayout)
            this.engine.enforceClientSize(window);
    }

    public onWindowGeometryChanged(window: Window): void {
        debugObj(() => ["onWindowGeometryChanged", {window}]);
        this.engine.enforceClientSize(window);
    }

    // NOTE: accepts `null` to simplify caller. This event is a catch-all hack
    // by itself anyway.
    public onWindowChanged(window: Window | null, comment?: string): void {
        if (!window) return;
        debugObj(() => ["onWindowChanged", {window, comment}]);
        /* TODO: maybe a less brutal solution? */
        this.engine.arrange();
    }
}
