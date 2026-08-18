window.__ModuleLoader__.load({
	id: "dsh-workspace-picker-enhance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const react = require("react");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const {
			Modal,
			Button,
			Tooltip,
			IconChevronRightOutline14,
			IconChevronUpOutline14,
			IconFolderOpen16,
			IconWarningOutline16,
			IconEditOutline16,
			IconRefreshOutline16,
		} = primitives;

		const h = react.createElement;
		const { useState, useEffect, useRef, useCallback } = react;

		// ---------- styles ----------
		const CSS = `
.wpe-dialog.wpe-dialog {
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  gap: 0;
  width: min(680px, 100%);
  height: min(520px, 100dvh - 32px);
  padding: 0;
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1.45;
}
.wpe-dialog * { box-sizing: border-box; }
.wpe-header {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 14px 10px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l3);
}
.wpe-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wpe-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  flex: 1;
}
.wpe-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
}
.wpe-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  flex: none;
}
.wpe-icon-btn:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.wpe-icon-btn:disabled {
  opacity: .45;
  cursor: default;
}
.wpe-crumbs {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.wpe-crumbs::-webkit-scrollbar { display: none; }
.wpe-crumb {
  appearance: none;
  background: transparent;
  border: none;
  padding: 2px 5px;
  border-radius: 5px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wpe-crumb:hover {
  color: var(--dsw-alias-label-primary);
  text-decoration: underline;
  background: var(--dsw-alias-bg-layer-1);
}
.wpe-crumb-sep {
  display: inline-flex;
  color: var(--dsw-alias-label-tertiary);
  flex: none;
}
.wpe-path {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary);
  padding: 0 2px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: ltr;
}
.wpe-content {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 12px 12px 14px;
  overflow: hidden;
  position: relative;
}
.wpe-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 4px;
}
.wpe-row {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}
.wpe-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.wpe-row:disabled {
  cursor: not-allowed;
}
.wpe-row-icon { display: inline-flex; flex: none; color: var(--dsw-alias-label-secondary); }
.wpe-row-icon-folder { color: var(--dsw-alias-brand-primary); }
.wpe-row-icon-warn { color: #d97706; }
.wpe-row-name {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wpe-row-kind {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  margin-left: auto;
  padding-left: 8px;
}
.wpe-row-no-permission {
  color: var(--dsw-alias-label-tertiary);
  opacity: .72;
}
.wpe-row-no-permission .wpe-row-name {
  text-decoration: line-through;
}
.wpe-row-system:not(.wpe-row-no-permission) .wpe-row-name {
  color: #b45309;
}
.wpe-row-hidden {
  opacity: .6;
}
.wpe-row-loop {
  opacity: .65;
}
.wpe-empty {
  color: var(--dsw-alias-label-secondary);
  padding: 18px 10px;
  font-size: 13px;
}
.wpe-error {
  color: var(--dsw-alias-state-error-primary);
  padding: 6px 8px;
  font-size: 12px;
  line-height: 18px;
}
.wpe-status {
  color: var(--dsw-alias-label-secondary);
  padding: 4px 8px;
  font-size: 12px;
}
.wpe-toast {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,.14);
  z-index: 5;
  white-space: nowrap;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wpe-footer {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--dsw-alias-border-l3);
  flex-wrap: wrap;
}
.wpe-footer-gap { flex: 1; }
.wpe-manual {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 2px;
}
.wpe-manual-input {
  width: 100%;
  height: 36px;
  padding: 6px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  outline: none;
}
.wpe-manual-input:focus { border-color: var(--dsw-alias-brand-primary); }
.wpe-manual-actions { display: flex; gap: 8px; justify-content: flex-end; }
`;

		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"dsh-workspace-picker-enhance\"]") === null) {
			const style = document.createElement("style");
			style.dataset.pluginCss = "dsh-workspace-picker-enhance";
			style.textContent = CSS;
			document.head.appendChild(style);
		}

		// ---------- API ----------
		function parseResponse(r) {
			if (r.ok) return r.json();
			return r.json().catch(() => ({ error: 'HTTP ' + r.status }));
		}
		const api = {
			roots: () => fetch('/plugins/workspace-picker-enhance/roots').then(parseResponse),
			list: (path) => fetch('/plugins/workspace-picker-enhance/list?path=' + encodeURIComponent(path)).then(parseResponse),
		};

		// ---------- helpers ----------
		function computerLabel(platform) {
			return platform === 'win32' ? '此电脑' : '/';
		}

		function displayCrumbs(listing, platform) {
			const crumbs = listing && listing.crumbs ? listing.crumbs.slice() : [];
			if (platform === 'win32' && crumbs.length > 0) {
				return [{ name: '此电脑', path: '::computer', kind: 'computer' }, ...crumbs];
			}
			return crumbs;
		}

		function isRootPath(p, platform) {
			if (!p) return false;
			if (platform === 'win32') return /^[A-Za-z]:[\\/]?$/.test(p);
			return p === '/';
		}

		function parentPath(listing, platform) {
			if (!listing || !listing.crumbs || listing.crumbs.length <= 1) return null;
			return listing.crumbs[listing.crumbs.length - 2].path;
		}

		function rowLabel(entry) {
			if (entry.readable === false) return '无访问权限，不可选择';
			if (entry.loop === true) return '目录循环，无法进入';
			if (entry.system) return '系统目录，修改可能影响系统稳定性';
			return '';
		}

		// ---------- component ----------
		function EnhancedDirectoryFlow(props) {
			const open = props.open;
			const busy = props.busy;
			const onPicked = props.onPicked;
			const onCancel = props.onCancel;
			const t = props.t || ((key) => key);

			const [mode, setMode] = useState('roots'); // roots | dir | manual
			const [rootsData, setRootsData] = useState(null);
			const [listing, setListing] = useState(null);
			const [loading, setLoading] = useState(false);
			const [error, setError] = useState(null);
			const [notice, setNotice] = useState(null);
			const [manualDraft, setManualDraft] = useState('');
			const [selectedPath, setSelectedPath] = useState(null);
			const requestSeq = useRef(0);
			const noticeTimer = useRef(null);

			const showNotice = useCallback((text) => {
				setNotice(text);
				if (noticeTimer.current) clearTimeout(noticeTimer.current);
				noticeTimer.current = setTimeout(() => setNotice(null), 2600);
			}, []);

			useEffect(() => () => {
				requestSeq.current += 1;
				if (noticeTimer.current) clearTimeout(noticeTimer.current);
			}, []);

			const goRoots = useCallback(() => {
				const seq = ++requestSeq.current;
				setMode('roots');
				setLoading(true);
				setError(null);
				setListing(null);
				setSelectedPath(null);
				api.roots().then((data) => {
					if (seq !== requestSeq.current) return;
					setRootsData(data);
					setLoading(false);
				}).catch((reason) => {
					if (seq !== requestSeq.current) return;
					setError(reason instanceof Error ? reason.message : String(reason));
					setLoading(false);
				});
			}, []);

			const navigate = useCallback((path) => {
				if (!path || path === '::computer') {
					goRoots();
					return;
				}
				const seq = ++requestSeq.current;
				setMode('dir');
				setLoading(true);
				setError(null);
				setListing(null);
				setSelectedPath(null);
				api.list(path).then((data) => {
					if (seq !== requestSeq.current) return;
					if (data.error) {
						setError(data.error);
						setLoading(false);
						return;
					}
					setListing(data);
					setSelectedPath(data.path);
					setLoading(false);
				}).catch((reason) => {
					if (seq !== requestSeq.current) return;
					setError(reason instanceof Error ? reason.message : String(reason));
					setLoading(false);
				});
			}, [goRoots]);

			const goUp = useCallback(() => {
				if (mode === 'roots') return;
				const platform = rootsData?.platform || (listing && listing.platform) || 'linux';
				if (!listing || isRootPath(listing.path, platform)) {
					goRoots();
					return;
				}
				const parent = parentPath(listing, platform);
				if (parent) navigate(parent);
			}, [mode, rootsData, listing, goRoots, navigate]);

			const handleRowClick = useCallback((entry) => {
				if (entry.readable === false) {
					showNotice('无法访问此文件夹');
					return;
				}
				if (entry.loop === true) {
					showNotice('检测到目录循环，无法进入');
					return;
				}
				navigate(entry.path);
			}, [navigate, showNotice]);

			const enterManual = useCallback(() => {
				const current = mode === 'dir' && listing ? listing.path : '';
				setManualDraft(current || '');
				setMode('manual');
				setError(null);
			}, [mode, listing]);

			const submitManualBrowse = useCallback(() => {
				const draft = manualDraft.trim();
				if (!draft) return;
				navigate(draft);
			}, [manualDraft, navigate]);

			const submitManualPick = useCallback(() => {
				const draft = manualDraft.trim();
				if (!draft) return;
				onPicked(draft);
			}, [manualDraft, onPicked]);

			useEffect(() => {
				if (!open) return;
				requestSeq.current += 1;
				setMode('roots');
				setListing(null);
				setSelectedPath(null);
				setError(null);
				setNotice(null);
				setManualDraft('');
				setLoading(true);
				api.roots().then((data) => {
					if (!open) return;
					setRootsData(data);
					setLoading(false);
				}).catch((reason) => {
					if (!open) return;
					setError(reason instanceof Error ? reason.message : String(reason));
					setLoading(false);
				});
				return () => {
					requestSeq.current += 1;
				};
			}, [open]);

			if (!open) return null;

			const platform = rootsData?.platform || (listing && listing.platform) || 'linux';
			const crumbs = mode === 'roots'
				? [{ name: computerLabel(platform), path: '::computer', kind: 'computer' }]
				: (mode === 'dir' && listing ? displayCrumbs(listing, platform) : []);

			const footerOpenDisabled = mode !== 'dir' || !listing || loading || busy;

			const listContent = mode === 'roots'
				? (rootsData ? rootsData.roots : [])
				: (mode === 'dir' && listing ? listing.entries : []);

			const renderRow = (entry, index) => {
				const blocked = entry.readable === false;
				const looped = entry.loop === true;
				const label = rowLabel(entry);
				const icon = blocked
					? h('span', { className: 'wpe-row-icon' }, '🔒')
					: entry.system
						? h(IconWarningOutline16, { size: 15, className: 'wpe-row-icon wpe-row-icon-warn' })
						: h(IconFolderOpen16, { size: 16, className: 'wpe-row-icon wpe-row-icon-folder' });
				const row = h('button', {
					type: 'button',
					key: entry.path || index,
					className: 'wpe-row'
						+ (blocked ? ' wpe-row-no-permission' : '')
						+ (entry.hidden ? ' wpe-row-hidden' : '')
						+ (entry.system ? ' wpe-row-system' : '')
						+ (looped ? ' wpe-row-loop' : ''),
					'aria-disabled': (blocked || looped) || undefined,
					onClick: () => handleRowClick(entry),
					title: label || undefined,
					'aria-label': (entry.name || '') + (label ? '，' + label : ''),
				}, icon, h('span', { className: 'wpe-row-name' }, entry.name || entry.path), h('span', { className: 'wpe-row-kind' }, entry.kind === 'drive' ? '磁盘' : entry.kind === 'mount' ? '挂载点' : entry.kind === 'root' ? '根目录' : '文件夹'));

				if (!label) return row;
				return h(Tooltip, { key: entry.path || index, label, side: 'right' }, row);
			};

			return h(Modal, {
				open,
				onClose: () => { if (!busy) onCancel(); },
				title: t('browser.title'),
				className: 'wpe-dialog',
				headless: true,
			},
				h('div', { className: 'wpe-header' },
					h('div', { className: 'wpe-title-row' },
						h('h2', { className: 'wpe-title' }, t('browser.title')),
						h('button', {
							type: 'button',
							className: 'wpe-icon-btn',
							title: t('browser.refresh'),
							onClick: () => {
								if (mode === 'roots') goRoots();
								else if (mode === 'dir' && listing) navigate(listing.path);
							},
							disabled: loading,
						}, h(IconRefreshOutline16, { size: 15 })),
						h('button', {
							type: 'button',
							className: 'wpe-icon-btn',
							title: t('browser.manual'),
							onClick: enterManual,
						}, h(IconEditOutline16, { size: 15 })),
					),
					h('div', { className: 'wpe-toolbar' },
						h('button', {
							type: 'button',
							className: 'wpe-icon-btn',
							title: t('browser.up'),
							onClick: goUp,
							disabled: mode === 'roots' || loading,
						}, h(IconChevronUpOutline14, { size: 15 })),
						h('div', { className: 'wpe-crumbs', role: 'navigation' },
							crumbs.map((crumb, index) => h('span', { key: crumb.path + '-' + index, style: { display: 'inline-flex', alignItems: 'center', minWidth: 0 } },
								index > 0 ? h(IconChevronRightOutline14, { size: 12, className: 'wpe-crumb-sep' }) : null,
								h('button', {
									type: 'button',
									className: 'wpe-crumb',
									disabled: mode === 'roots' || loading,
									onClick: () => {
										if (crumb.path === '::computer') goRoots();
										else navigate(crumb.path);
									},
								}, crumb.name)
							))
						),
					),
					mode === 'dir' && listing ? h('div', { className: 'wpe-path' }, listing.path) : null,
				),
				h('div', { className: 'wpe-content' },
					mode === 'manual' ? h('div', { className: 'wpe-manual' },
						h('input', {
							className: 'wpe-manual-input',
							value: manualDraft,
							placeholder: t('browser.manualPlaceholder'),
							autoFocus: true,
							onChange: (e) => setManualDraft(e.target.value),
							onKeyDown: (e) => {
								if (e.key === 'Enter') submitManualBrowse();
							},
						}),
						h('div', { className: 'wpe-manual-actions' },
							h(Button, { variant: 'outline', onClick: goRoots }, t('browser.backGraphical')),
							h(Button, { variant: 'outline', onClick: submitManualBrowse }, t('browser.browse')),
							h(Button, { variant: 'primary', onClick: submitManualPick }, t('browser.pickPath')),
						),
						error ? h('div', { className: 'wpe-error', role: 'alert' }, error) : null,
					) : h('div', { className: 'wpe-list' },
						loading && listContent.length === 0 ? h('div', { className: 'wpe-status' }, t('browser.loading')) : null,
						listContent.length === 0 && !loading ? h('div', { className: 'wpe-empty' }, t('browser.empty')) : null,
						listContent.map(renderRow),
						error ? h('div', { className: 'wpe-error', role: 'alert' }, error) : null,
					),
					notice ? h('div', { className: 'wpe-toast', role: 'status' }, notice) : null,
				),
				h('div', { className: 'wpe-footer' },
					h(Button, { variant: 'outline', onClick: onCancel, disabled: busy }, t('browser.cancel')),
					h('span', { className: 'wpe-footer-gap' }),
					h(Button, {
						variant: 'primary',
						disabled: footerOpenDisabled,
						onClick: () => { if (selectedPath) onPicked(selectedPath); },
					}, t('browser.open')),
				)
			);
		}

		// ---------- flow registration ----------
		const LOCALE_NS = 'workspace-picker-enhance';
		const inject = ['slots', 'locale'];

		function apply(ctx) {
			ctx.effect(() => {
				const disposers = [];
				const dictionaries = [
					['zh', {
						'browser.title': '选择工作区目录',
						'browser.up': '返回上一级',
						'browser.refresh': '刷新',
						'browser.manual': '手动输入路径',
						'browser.manualPlaceholder': '输入完整路径，如 D:\\Projects\\AI',
						'browser.browse': '浏览',
						'browser.pickPath': '选择此路径',
						'browser.backGraphical': '返回图形浏览',
						'browser.open': '选择此文件夹',
						'browser.cancel': '取消',
						'browser.loading': '加载中…',
						'browser.empty': '此位置没有可进入的文件夹',
					}],
					['en', {
						'browser.title': 'Select Workspace Directory',
						'browser.up': 'Up one level',
						'browser.refresh': 'Refresh',
						'browser.manual': 'Enter path manually',
						'browser.manualPlaceholder': 'Enter full path, e.g. /home/user/project',
						'browser.browse': 'Browse',
						'browser.pickPath': 'Use this path',
						'browser.backGraphical': 'Back to graphical browser',
						'browser.open': 'Select this folder',
						'browser.cancel': 'Cancel',
						'browser.loading': 'Loading…',
						'browser.empty': 'No enterable folders here',
					}],
				];
				try {
					for (const [locale, dict] of dictionaries) disposers.push(ctx.locale.register(LOCALE_NS, locale, dict));
				} catch (error) {
					for (const dispose of disposers.reverse()) dispose();
					throw error;
				}
				return () => {
					for (const dispose of disposers) dispose();
				};
			}, 'workspace-picker-enhance: dictionaries');

			const injected = () => ({
				listDirectory: (path, signal) => {
					// The enhanced browser uses its own API for permission/risk metadata.
					// Keep this shape for compatibility with the directory-flow owner.
					return api.list(path);
				},
				createDirectory: () => Promise.reject(new Error('new folder is not available in enhanced mode')),
				roots: () => api.roots(),
				t: ctx.locale.bind(LOCALE_NS),
			});

			ctx.slots.inject('conversation.hero.workspace.directoryFlow', () => ctx.slots.inject('sidebar.workspaces.directoryFlow', function* () {
				yield ctx.slots.register({
					name: 'conversation.hero.workspace.directoryFlow',
					priority: -1,
					inject: injected,
				}, EnhancedDirectoryFlow);
				yield ctx.slots.register({
					name: 'sidebar.workspaces.directoryFlow',
					priority: -1,
					inject: injected,
				}, EnhancedDirectoryFlow);
			}));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
