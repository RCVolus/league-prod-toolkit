
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const state = writable();
    const match = writable();
    const isActive = writable(false);
    const bansActive = writable(false);
    const blueColor = writable('var(--text-color-dark)');
    const redColor = writable('var(--text-color)');
    const turn = writable("neutral");

    /* src\components\Moddle.svelte generated by Svelte v3.50.1 */
    const file$5 = "src\\components\\Moddle.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let p;
    	let t1_value = (/*$state*/ ctx[2]?.timer ?? 0) + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "svelte-polmi8");
    			toggle_class(div0, "pulse", /*$turn*/ ctx[1] !== 'neutral');
    			add_location(div0, file$5, 80, 2, 1656);
    			attr_dev(p, "class", "timer svelte-polmi8");
    			add_location(p, file$5, 81, 2, 1705);
    			attr_dev(div1, "class", "middle svelte-polmi8");
    			toggle_class(div1, "bans-active", /*$bansActive*/ ctx[0]);
    			toggle_class(div1, "blue", /*$turn*/ ctx[1] === 'blue');
    			toggle_class(div1, "red", /*$turn*/ ctx[1] === 'red');
    			add_location(div1, file$5, 74, 0, 1522);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$turn*/ 2) {
    				toggle_class(div0, "pulse", /*$turn*/ ctx[1] !== 'neutral');
    			}

    			if (dirty & /*$state*/ 4 && t1_value !== (t1_value = (/*$state*/ ctx[2]?.timer ?? 0) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$bansActive*/ 1) {
    				toggle_class(div1, "bans-active", /*$bansActive*/ ctx[0]);
    			}

    			if (dirty & /*$turn*/ 2) {
    				toggle_class(div1, "blue", /*$turn*/ ctx[1] === 'blue');
    			}

    			if (dirty & /*$turn*/ 2) {
    				toggle_class(div1, "red", /*$turn*/ ctx[1] === 'red');
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $bansActive;
    	let $turn;
    	let $state;
    	validate_store(bansActive, 'bansActive');
    	component_subscribe($$self, bansActive, $$value => $$invalidate(0, $bansActive = $$value));
    	validate_store(turn, 'turn');
    	component_subscribe($$self, turn, $$value => $$invalidate(1, $turn = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(2, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Moddle', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Moddle> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		state,
    		bansActive,
    		turn,
    		$bansActive,
    		$turn,
    		$state
    	});

    	return [$bansActive, $turn, $state];
    }

    class Moddle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Moddle",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Ban.svelte generated by Svelte v3.50.1 */

    const file$4 = "src\\components\\Ban.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "svelte-3nprfh");
    			toggle_class(div0, "pulse", /*ban*/ ctx[0]?.isActive);
    			add_location(div0, file$4, 4, 2, 164);
    			attr_dev(div1, "class", "ban svelte-3nprfh");
    			set_style(div1, "background-image", "url(" + (/*ban*/ ctx[0]?.champion.loadingImg || '') + ")");
    			toggle_class(div1, "done", !/*ban*/ ctx[0]?.isActive);
    			add_location(div1, file$4, 3, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ban*/ 1) {
    				toggle_class(div0, "pulse", /*ban*/ ctx[0]?.isActive);
    			}

    			if (dirty & /*ban*/ 1) {
    				set_style(div1, "background-image", "url(" + (/*ban*/ ctx[0]?.champion.loadingImg || '') + ")");
    			}

    			if (dirty & /*ban*/ 1) {
    				toggle_class(div1, "done", !/*ban*/ ctx[0]?.isActive);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ban', slots, []);
    	let { ban } = $$props;
    	const writable_props = ['ban'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ban> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ban' in $$props) $$invalidate(0, ban = $$props.ban);
    	};

    	$$self.$capture_state = () => ({ ban });

    	$$self.$inject_state = $$props => {
    		if ('ban' in $$props) $$invalidate(0, ban = $$props.ban);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ban];
    }

    class Ban extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { ban: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ban",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ban*/ ctx[0] === undefined && !('ban' in props)) {
    			console.warn("<Ban> was created without expected prop 'ban'");
    		}
    	}

    	get ban() {
    		throw new Error("<Ban>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ban(value) {
    		throw new Error("<Ban>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pick.svelte generated by Svelte v3.50.1 */
    const file$3 = "src\\components\\Pick.svelte";

    function create_fragment$3(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let p;
    	let t1_value = /*pick*/ ctx[0]?.displayName + "";
    	let t1;
    	let t2;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t3 = space();
    			img1 = element("img");
    			attr_dev(div0, "class", "svelte-t3tc69");
    			toggle_class(div0, "pulse", /*pick*/ ctx[0]?.isActive);
    			add_location(div0, file$3, 235, 2, 4851);
    			attr_dev(p, "class", "svelte-t3tc69");
    			add_location(p, file$3, 237, 4, 4919);
    			if (!src_url_equal(img0.src, img0_src_value = /*pick*/ ctx[0]?.spell1.icon)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-t3tc69");
    			add_location(img0, file$3, 239, 6, 5029);
    			if (!src_url_equal(img1.src, img1_src_value = /*pick*/ ctx[0]?.spell2.icon)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-t3tc69");
    			add_location(img1, file$3, 240, 6, 5073);
    			attr_dev(div1, "class", "summoners svelte-t3tc69");
    			toggle_class(div1, "show", /*$state*/ ctx[1]?.phase === 'GAME_STARTING');
    			add_location(div1, file$3, 238, 4, 4951);
    			attr_dev(div2, "class", "name svelte-t3tc69");
    			add_location(div2, file$3, 236, 2, 4895);
    			attr_dev(div3, "class", "pick svelte-t3tc69");
    			set_style(div3, "background-image", "url(" + /*pick*/ ctx[0]?.champion.splashCenteredImg + ")");
    			toggle_class(div3, "active", /*pick*/ ctx[0]?.isActive);
    			toggle_class(div3, "done", /*done*/ ctx[2]);
    			add_location(div3, file$3, 234, 0, 4720);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(p, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t3);
    			append_dev(div1, img1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pick*/ 1) {
    				toggle_class(div0, "pulse", /*pick*/ ctx[0]?.isActive);
    			}

    			if (dirty & /*pick*/ 1 && t1_value !== (t1_value = /*pick*/ ctx[0]?.displayName + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*pick*/ 1 && !src_url_equal(img0.src, img0_src_value = /*pick*/ ctx[0]?.spell1.icon)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*pick*/ 1 && !src_url_equal(img1.src, img1_src_value = /*pick*/ ctx[0]?.spell2.icon)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*$state*/ 2) {
    				toggle_class(div1, "show", /*$state*/ ctx[1]?.phase === 'GAME_STARTING');
    			}

    			if (dirty & /*pick*/ 1) {
    				set_style(div3, "background-image", "url(" + /*pick*/ ctx[0]?.champion.splashCenteredImg + ")");
    			}

    			if (dirty & /*pick*/ 1) {
    				toggle_class(div3, "active", /*pick*/ ctx[0]?.isActive);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $state;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(1, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pick', slots, []);
    	let { pick } = $$props;

    	let done = (pick === null || pick === void 0
    	? void 0
    	: pick.isActive) && pick.champion.splashCenteredImg;

    	const writable_props = ['pick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pick> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('pick' in $$props) $$invalidate(0, pick = $$props.pick);
    	};

    	$$self.$capture_state = () => ({ state, pick, done, $state });

    	$$self.$inject_state = $$props => {
    		if ('pick' in $$props) $$invalidate(0, pick = $$props.pick);
    		if ('done' in $$props) $$invalidate(2, done = $$props.done);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pick, $state, done];
    }

    class Pick extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { pick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pick",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pick*/ ctx[0] === undefined && !('pick' in props)) {
    			console.warn("<Pick> was created without expected prop 'pick'");
    		}
    	}

    	get pick() {
    		throw new Error("<Pick>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pick(value) {
    		throw new Error("<Pick>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Team.svelte generated by Svelte v3.50.1 */
    const file$2 = "src\\components\\Team.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (179:6) {#if $match?.bestOf > 1}
    function create_if_block(ctx) {
    	let div;

    	let t_value = (/*team*/ ctx[0] === 100
    	? /*$match*/ ctx[2]?.teams?.blueTeam?.score
    	: /*$match*/ ctx[2]?.teams?.redTeam?.score) + "";

    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "points svelte-14fphdd");
    			add_location(div, file$2, 179, 8, 5248);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*team, $match*/ 5 && t_value !== (t_value = (/*team*/ ctx[0] === 100
    			? /*$match*/ ctx[2]?.teams?.blueTeam?.score
    			: /*$match*/ ctx[2]?.teams?.redTeam?.score) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(179:6) {#if $match?.bestOf > 1}",
    		ctx
    	});

    	return block;
    }

    // (190:4) {#each picks as pick}
    function create_each_block_1(ctx) {
    	let pick;
    	let current;

    	pick = new Pick({
    			props: { pick: /*pick*/ ctx[20] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pick.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pick, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const pick_changes = {};
    			if (dirty & /*picks*/ 8) pick_changes.pick = /*pick*/ ctx[20];
    			pick.$set(pick_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pick.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pick.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pick, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(190:4) {#each picks as pick}",
    		ctx
    	});

    	return block;
    }

    // (195:4) {#each bans as ban}
    function create_each_block(ctx) {
    	let ban;
    	let current;

    	ban = new Ban({
    			props: { ban: /*ban*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ban.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ban, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ban_changes = {};
    			if (dirty & /*bans*/ 2) ban_changes.ban = /*ban*/ ctx[17];
    			ban.$set(ban_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ban.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ban.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ban, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(195:4) {#each bans as ban}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div9;
    	let div6;
    	let div0;

    	let t0_value = (/*team*/ ctx[0] === 100
    	? /*$match*/ ctx[2]?.teams?.blueTeam?.tag
    	: /*$match*/ ctx[2]?.teams?.redTeam?.tag) + "";

    	let t0;
    	let t1;
    	let div3;
    	let div1;

    	let t2_value = (/*team*/ ctx[0] === 100
    	? /*$match*/ ctx[2]?.teams?.blueTeam?.name
    	: /*$match*/ ctx[2]?.teams?.redTeam?.name) + "";

    	let t2;
    	let t3;
    	let div2;

    	let t4_value = (/*coach*/ ctx[4] && /*coach*/ ctx[4] !== ''
    	? 'Coach: ' + /*coach*/ ctx[4]
    	: '') + "";

    	let t4;
    	let t5;
    	let div5;
    	let t6;
    	let div4;

    	let t7_value = (/*team*/ ctx[0] === 100
    	? /*$match*/ ctx[2]?.teams?.blueTeam?.standing ?? ""
    	: /*$match*/ ctx[2]?.teams?.redTeam?.standing ?? "") + "";

    	let t7;
    	let t8;
    	let div7;
    	let t9;
    	let div8;
    	let current;
    	let if_block = /*$match*/ ctx[2]?.bestOf > 1 && create_if_block(ctx);
    	let each_value_1 = /*picks*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*bans*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div5 = element("div");
    			if (if_block) if_block.c();
    			t6 = space();
    			div4 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			div8 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "tag svelte-14fphdd");
    			add_location(div0, file$2, 172, 4, 4857);
    			attr_dev(div1, "class", "name svelte-14fphdd");
    			add_location(div1, file$2, 174, 6, 4987);
    			attr_dev(div2, "class", "coach svelte-14fphdd");
    			add_location(div2, file$2, 175, 6, 5096);
    			attr_dev(div3, "class", "iofo");
    			add_location(div3, file$2, 173, 4, 4961);
    			attr_dev(div4, "class", "standing svelte-14fphdd");
    			add_location(div4, file$2, 183, 6, 5396);
    			attr_dev(div5, "class", "score svelte-14fphdd");
    			add_location(div5, file$2, 177, 4, 5187);
    			attr_dev(div6, "class", "teaminfo svelte-14fphdd");
    			toggle_class(div6, "has-score", /*$match*/ ctx[2]?.bestOf > 1);
    			add_location(div6, file$2, 171, 2, 4790);
    			attr_dev(div7, "class", "picks svelte-14fphdd");
    			add_location(div7, file$2, 188, 2, 5565);
    			attr_dev(div8, "class", "bans svelte-14fphdd");
    			add_location(div8, file$2, 193, 2, 5668);
    			attr_dev(div9, "class", "team svelte-14fphdd");

    			set_style(div9, "color", /*team*/ ctx[0] === 100
    			? /*$blueColor*/ ctx[6]
    			: /*$redColor*/ ctx[7]);

    			toggle_class(div9, "blue", /*team*/ ctx[0] === 100);
    			toggle_class(div9, "red", /*team*/ ctx[0] === 200);
    			toggle_class(div9, "bans-active", /*$bansActive*/ ctx[5]);
    			add_location(div9, file$2, 164, 0, 4606);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div6);
    			append_dev(div6, div0);
    			append_dev(div0, t0);
    			append_dev(div6, t1);
    			append_dev(div6, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			if (if_block) if_block.m(div5, null);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, t7);
    			append_dev(div9, t8);
    			append_dev(div9, div7);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div7, null);
    			}

    			append_dev(div9, t9);
    			append_dev(div9, div8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*team, $match*/ 5) && t0_value !== (t0_value = (/*team*/ ctx[0] === 100
    			? /*$match*/ ctx[2]?.teams?.blueTeam?.tag
    			: /*$match*/ ctx[2]?.teams?.redTeam?.tag) + "")) set_data_dev(t0, t0_value);

    			if ((!current || dirty & /*team, $match*/ 5) && t2_value !== (t2_value = (/*team*/ ctx[0] === 100
    			? /*$match*/ ctx[2]?.teams?.blueTeam?.name
    			: /*$match*/ ctx[2]?.teams?.redTeam?.name) + "")) set_data_dev(t2, t2_value);

    			if ((!current || dirty & /*coach*/ 16) && t4_value !== (t4_value = (/*coach*/ ctx[4] && /*coach*/ ctx[4] !== ''
    			? 'Coach: ' + /*coach*/ ctx[4]
    			: '') + "")) set_data_dev(t4, t4_value);

    			if (/*$match*/ ctx[2]?.bestOf > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div5, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || dirty & /*team, $match*/ 5) && t7_value !== (t7_value = (/*team*/ ctx[0] === 100
    			? /*$match*/ ctx[2]?.teams?.blueTeam?.standing ?? ""
    			: /*$match*/ ctx[2]?.teams?.redTeam?.standing ?? "") + "")) set_data_dev(t7, t7_value);

    			if (!current || dirty & /*$match*/ 4) {
    				toggle_class(div6, "has-score", /*$match*/ ctx[2]?.bestOf > 1);
    			}

    			if (dirty & /*picks*/ 8) {
    				each_value_1 = /*picks*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div7, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*bans*/ 2) {
    				each_value = /*bans*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div8, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*team, $blueColor, $redColor*/ 193) {
    				set_style(div9, "color", /*team*/ ctx[0] === 100
    				? /*$blueColor*/ ctx[6]
    				: /*$redColor*/ ctx[7]);
    			}

    			if (!current || dirty & /*team*/ 1) {
    				toggle_class(div9, "blue", /*team*/ ctx[0] === 100);
    			}

    			if (!current || dirty & /*team*/ 1) {
    				toggle_class(div9, "red", /*team*/ ctx[0] === 200);
    			}

    			if (!current || dirty & /*$bansActive*/ 32) {
    				toggle_class(div9, "bans-active", /*$bansActive*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $match;
    	let $state;
    	let $bansActive;
    	let $blueColor;
    	let $redColor;
    	validate_store(match, 'match');
    	component_subscribe($$self, match, $$value => $$invalidate(2, $match = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(16, $state = $$value));
    	validate_store(bansActive, 'bansActive');
    	component_subscribe($$self, bansActive, $$value => $$invalidate(5, $bansActive = $$value));
    	validate_store(blueColor, 'blueColor');
    	component_subscribe($$self, blueColor, $$value => $$invalidate(6, $blueColor = $$value));
    	validate_store(redColor, 'redColor');
    	component_subscribe($$self, redColor, $$value => $$invalidate(7, $redColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);
    	var _a, _b, _c, _d, _e, _f, _g, _h;
    	let { team } = $$props;
    	let picks = [];
    	let bans = [];
    	let coach;
    	const writable_props = ['team'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('team' in $$props) $$invalidate(0, team = $$props.team);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		_b,
    		_c,
    		_d,
    		_e,
    		_f,
    		_g,
    		_h,
    		Ban,
    		Pick,
    		state,
    		bansActive,
    		match,
    		blueColor,
    		redColor,
    		team,
    		picks,
    		bans,
    		coach,
    		$match,
    		$state,
    		$bansActive,
    		$blueColor,
    		$redColor
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) $$invalidate(8, _a = $$props._a);
    		if ('_b' in $$props) $$invalidate(9, _b = $$props._b);
    		if ('_c' in $$props) $$invalidate(10, _c = $$props._c);
    		if ('_d' in $$props) $$invalidate(11, _d = $$props._d);
    		if ('_e' in $$props) $$invalidate(12, _e = $$props._e);
    		if ('_f' in $$props) $$invalidate(13, _f = $$props._f);
    		if ('_g' in $$props) $$invalidate(14, _g = $$props._g);
    		if ('_h' in $$props) $$invalidate(15, _h = $$props._h);
    		if ('team' in $$props) $$invalidate(0, team = $$props.team);
    		if ('picks' in $$props) $$invalidate(3, picks = $$props.picks);
    		if ('bans' in $$props) $$invalidate(1, bans = $$props.bans);
    		if ('coach' in $$props) $$invalidate(4, coach = $$props.coach);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*team, $state, _a, _b*/ 66305) {
    			{
    				$$invalidate(3, picks = team === 100
    				? $$invalidate(8, _a = $state === null || $state === void 0
    					? void 0
    					: $state.blueTeam.picks) !== null && _a !== void 0
    					? _a
    					: [null, null, null, null, null]
    				: $$invalidate(9, _b = $state === null || $state === void 0
    					? void 0
    					: $state.redTeam.picks) !== null && _b !== void 0
    					? _b
    					: [null, null, null, null, null]);
    			}
    		}

    		if ($$self.$$.dirty & /*team, $state, _c, _d, bans*/ 68611) {
    			{
    				$$invalidate(1, bans = team === 100
    				? $$invalidate(10, _c = $state === null || $state === void 0
    					? void 0
    					: $state.blueTeam.bans) !== null && _c !== void 0
    					? _c
    					: [null, null, null, null, null]
    				: $$invalidate(11, _d = $state === null || $state === void 0
    					? void 0
    					: $state.redTeam.bans) !== null && _d !== void 0
    					? _d
    					: [null, null, null, null, null]);

    				if ((($state === null || $state === void 0
    				? void 0
    				: $state.blueTeam.picks.length) > 0 || ($state === null || $state === void 0
    				? void 0
    				: $state.redTeam.picks.length) > 0) && (($state === null || $state === void 0
    				? void 0
    				: $state.blueTeam.picks.length) <= 3 || ($state === null || $state === void 0
    				? void 0
    				: $state.redTeam.picks.length) <= 3)) {
    					$$invalidate(1, bans = [...bans, ...new Array(3 - bans.length).fill(null)]);
    				} else if ((($state === null || $state === void 0
    				? void 0
    				: $state.blueTeam.picks.length) > 0 || ($state === null || $state === void 0
    				? void 0
    				: $state.redTeam.picks.length) > 0) && (($state === null || $state === void 0
    				? void 0
    				: $state.blueTeam.picks.length) > 3 || ($state === null || $state === void 0
    				? void 0
    				: $state.redTeam.picks.length) > 3)) {
    					$$invalidate(1, bans = [...bans, ...new Array(5 - bans.length).fill(null)]);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*team, $match, _e, _f, _g, _h*/ 61445) {
    			{
    				$$invalidate(4, coach = team === 100
    				? $$invalidate(13, _f = $$invalidate(12, _e = $match === null || $match === void 0
    					? void 0
    					: $match.teams) === null || _e === void 0
    					? void 0
    					: _e.blueTeam) === null || _f === void 0
    					? void 0
    					: _f.coach
    				: $$invalidate(15, _h = $$invalidate(14, _g = $match === null || $match === void 0
    					? void 0
    					: $match.teams) === null || _g === void 0
    					? void 0
    					: _g.redTeam) === null || _h === void 0
    					? void 0
    					: _h.coach);
    			}
    		}
    	};

    	return [
    		team,
    		bans,
    		$match,
    		picks,
    		coach,
    		$bansActive,
    		$blueColor,
    		$redColor,
    		_a,
    		_b,
    		_c,
    		_d,
    		_e,
    		_f,
    		_g,
    		_h,
    		$state
    	];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { team: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*team*/ ctx[0] === undefined && !('team' in props)) {
    			console.warn("<Team> was created without expected prop 'team'");
    		}
    	}

    	get team() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set team(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Overlay.svelte generated by Svelte v3.50.1 */
    const file$1 = "src\\components\\Overlay.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let team0;
    	let t0;
    	let moddle;
    	let t1;
    	let team1;
    	let div_intro;
    	let current;
    	team0 = new Team({ props: { team: 100 }, $$inline: true });
    	moddle = new Moddle({ $$inline: true });
    	team1 = new Team({ props: { team: 200 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(team0.$$.fragment);
    			t0 = space();
    			create_component(moddle.$$.fragment);
    			t1 = space();
    			create_component(team1.$$.fragment);
    			attr_dev(div, "class", "overlay svelte-1ht0yy5");
    			add_location(div, file$1, 12, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(team0, div, null);
    			append_dev(div, t0);
    			mount_component(moddle, div, null);
    			append_dev(div, t1);
    			mount_component(team1, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(team0.$$.fragment, local);
    			transition_in(moddle.$$.fragment, local);
    			transition_in(team1.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, slide, { duration: 500 });
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(team0.$$.fragment, local);
    			transition_out(moddle.$$.fragment, local);
    			transition_out(team1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(team0);
    			destroy_component(moddle);
    			destroy_component(team1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Overlay', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide, Moddle, Team });
    	return [];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    function shadeColor(color, percent) {
        var R = parseInt(color.substring(1, 3), 16);
        var G = parseInt(color.substring(3, 5), 16);
        var B = parseInt(color.substring(5, 7), 16);
        R = Math.round((R * (100 + percent)) / 100);
        G = Math.round((G * (100 + percent)) / 100);
        B = Math.round((B * (100 + percent)) / 100);
        R = R < 255 ? R : 255;
        G = G < 255 ? G : 255;
        B = B < 255 ? B : 255;
        var RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
        var GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
        var BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);
        return '#' + RR + GG + BB;
    }
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            }
            : null;
    }
    function changeColor(color) {
        const rgb = hexToRgb(color);
        const brightness = Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);
        return brightness < 150 ? "--text-color" : "--text-color-dark";
    }

    /* src\App.svelte generated by Svelte v3.50.1 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let overlay;
    	let current;
    	overlay = new Overlay({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(overlay.$$.fragment);
    			attr_dev(main, "class", "svelte-xfosat");
    			add_location(main, file, 78, 0, 3702);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(overlay, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overlay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(overlay);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $isActive;
    	let $state;
    	let $turn;
    	let $bansActive;
    	let $redColor;
    	let $blueColor;
    	let $match;
    	validate_store(isActive, 'isActive');
    	component_subscribe($$self, isActive, $$value => $$invalidate(1, $isActive = $$value));
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(0, $state = $$value));
    	validate_store(turn, 'turn');
    	component_subscribe($$self, turn, $$value => $$invalidate(2, $turn = $$value));
    	validate_store(bansActive, 'bansActive');
    	component_subscribe($$self, bansActive, $$value => $$invalidate(3, $bansActive = $$value));
    	validate_store(redColor, 'redColor');
    	component_subscribe($$self, redColor, $$value => $$invalidate(4, $redColor = $$value));
    	validate_store(blueColor, 'blueColor');
    	component_subscribe($$self, blueColor, $$value => $$invalidate(5, $blueColor = $$value));
    	validate_store(match, 'match');
    	component_subscribe($$self, match, $$value => $$invalidate(6, $match = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const themeBlue = document.querySelector(":root").style.getPropertyValue("--blue-team");
    	const themeBlueDark = document.querySelector(":root").style.getPropertyValue("--blue-team-dark");
    	const themeRed = document.querySelector(":root").style.getPropertyValue("--red-team");
    	const themeRedDark = document.querySelector(":root").style.getPropertyValue("--red-team-dark");

    	function updateMatch(e) {
    		var _a, _b, _c, _d;

    		set_store_value(
    			match,
    			$match = {
    				state: e.state,
    				teams: e.teams,
    				bestOf: e.bestOf,
    				roundOf: e.roundOf
    			},
    			$match
    		);

    		if (((_a = e.teams.blueTeam) === null || _a === void 0
    		? void 0
    		: _a.color) && ((_b = e.teams.blueTeam) === null || _b === void 0
    		? void 0
    		: _b.color) !== "#000000") {
    			document.querySelector(":root").style.setProperty("--blue-team", e.teams.blueTeam.color);
    			document.querySelector(":root").style.setProperty("--blue-team-dark", shadeColor(e.teams.blueTeam.color, -30));
    			set_store_value(blueColor, $blueColor = `var(${changeColor(e.teams.blueTeam.color)})`, $blueColor);
    		} else {
    			document.querySelector(":root").style.setProperty("--blue-team", themeBlue);
    			document.querySelector(":root").style.setProperty("--blue-team-dark", themeBlueDark);
    			set_store_value(blueColor, $blueColor = 'var(--text-color-dark)', $blueColor);
    		}

    		if (((_c = e.teams.redTeam) === null || _c === void 0
    		? void 0
    		: _c.color) && ((_d = e.teams.redTeam) === null || _d === void 0
    		? void 0
    		: _d.color) !== "#000000") {
    			document.querySelector(":root").style.setProperty("--red-team", e.teams.redTeam.color);
    			document.querySelector(":root").style.setProperty("--red-team-dark", shadeColor(e.teams.redTeam.color, -30));
    			set_store_value(redColor, $redColor = `var(${changeColor(e.teams.redTeam.color)})`, $redColor);
    		} else {
    			document.querySelector(":root").style.setProperty("--red-team", themeRed);
    			document.querySelector(":root").style.setProperty("--red-team-dark", themeRedDark);
    			set_store_value(redColor, $redColor = 'var(--text-color)', $redColor);
    		}
    	}

    	window.LPTE.onready(async () => {
    		window.LPTE.on("module-league-state", "champselect-update", e => {
    			set_store_value(state, $state = e.data, $state);
    			set_store_value(isActive, $isActive = e.isActive, $isActive);
    		});

    		window.LPTE.on("module-teams", "update", updateMatch);

    		const match = await window.LPTE.request({
    			meta: {
    				namespace: "module-teams",
    				type: "request-current",
    				version: 1
    			}
    		});

    		if (match === undefined) return;
    		updateMatch(match);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Overlay,
    		changeColor,
    		shadeColor,
    		state,
    		isActive,
    		bansActive,
    		match,
    		turn,
    		blueColor,
    		redColor,
    		themeBlue,
    		themeBlueDark,
    		themeRed,
    		themeRedDark,
    		updateMatch,
    		$isActive,
    		$state,
    		$turn,
    		$bansActive,
    		$redColor,
    		$blueColor,
    		$match
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$state*/ 1) {
    			{
    				setTimeout(
    					() => {
    						set_store_value(
    							bansActive,
    							$bansActive = ($state === null || $state === void 0
    							? void 0
    							: $state.blueTeam.bans.some(b => b.isActive)) || ($state === null || $state === void 0
    							? void 0
    							: $state.redTeam.bans.some(b => b.isActive)),
    							$bansActive
    						);

    						set_store_value(
    							turn,
    							$turn = ($state === null || $state === void 0
    							? void 0
    							: $state.blueTeam.bans.some(b => b.isActive)) || ($state === null || $state === void 0
    							? void 0
    							: $state.blueTeam.picks.some(p => p.isActive))
    							? "blue"
    							: ($state === null || $state === void 0
    								? void 0
    								: $state.redTeam.bans.some(b => b.isActive)) || ($state === null || $state === void 0
    								? void 0
    								: $state.redTeam.picks.some(p => p.isActive))
    								? "red"
    								: "neutral",
    							$turn
    						);
    					},
    					1000
    				);
    			}
    		}
    	};

    	return [$state];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
