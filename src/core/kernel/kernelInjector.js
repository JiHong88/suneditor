/**
 * @description Base class for kernel consumers (plugins, modules).
 * - Provides cached access to kernel dependencies via `$` object.
 * - Dependencies are built once in `CoreKernel` and shared across all consumers.
 * - Eliminates circular references by routing through the kernel.
 */
class KernelInjector {
	/** @type {SunEditor.Deps} */
	$;

	/**
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel) {
		this.$ = kernel.$;
	}
}

export default KernelInjector;
