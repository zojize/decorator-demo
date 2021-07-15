
export interface Validator<T> {
    validate(x: T): boolean;
    onFail?(arg: unknown): void;
    onSuccess?(arg: unknown): void;
}

// https://saul-mirone.github.io/a-complete-guide-to-typescript-decorator/
const validatorMap = new WeakMap<
    Object,
    Map<string | symbol, (Validator<unknown>[] | void)[]>
>();

export interface ValdateOptions {
    throw?: boolean;
    onSuccess?(...args: unknown[]): void;
    onFail?(...args: unknown[]): void;
}

export function validate(
    {
        throw: throw_ = true,
        onSuccess: globalOnSuccess,
        onFail: globalOnFail,
    }: ValdateOptions = {
        throw: true,
    }
) {
    return (
        target: Object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
    ) => {
        const validators = validatorMap.get(target)?.get(key);
        if (!validators) return;
        const originalFn: (...args: any[]) => any = descriptor.value! as any;
        descriptor.value = function (this: any, ...args: unknown[]) {
            let valid = false;
            args.forEach((arg, i) => {
                const paramValidators = validators[i] ?? [];
                if (!paramValidators.length) return arg;
                for (const { validate, onSuccess, onFail } of paramValidators) {
                    if (validate(arg)) {
                        onSuccess?.(arg);
                    } else {
                        onFail?.(arg);
                        globalOnFail?.(args);
                        valid = false;
                        if (throw_)
                            throw TypeError(
                                `Failed to valid parameter ${arg} for ${String(
                                    key
                                )} at index ${i}`
                            );
                    }
                }
                return arg;
            });
            valid && globalOnSuccess?.(args);
            originalFn.apply(this, args);
        };
    };
}

export function validateDesignType(value: any, target: Function | undefined) {
    return (
        (target &&
            (value instanceof target ||
                Object.getPrototypeOf(value)?.constructor === target)) ||
        (!target && (value === void 0 || value === null))
    );
}

validate.auto = function validate__auto(
    {
        throw: throw_ = true,
        onSuccess: globalOnSuccess,
        onFail: globalOnFail,
    }: ValdateOptions = {
        throw: true,
    }
) {
    return (
        target: Object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
    ) => {
        const paramtypes: (Function | undefined)[] | void = Reflect.getMetadata(
            "design:paramtypes",
            target,
            key
        );
        if (!paramtypes) return;
        const originalFn: (...args: any[]) => any = descriptor.value! as any;
        descriptor.value = function (this: any, ...args: unknown[]) {
            let valid = true;
            args.forEach((arg, i) => {
                if (!validateDesignType(arg, paramtypes[i])) {
                    valid = false;
                    globalOnFail?.(args);
                    if (throw_)
                        throw TypeError(
                            `Failed to valid parameter ${arg} for ${String(
                                key
                            )} at index ${i}`
                        );
                }
            });
            valid && globalOnSuccess?.(args);
            originalFn.apply(this, args);
        };
    };
};

export function validatorDecoratorFactory<T>(
    validator: Validator<T>
): ParameterDecorator {
    return (target, key, index) => {
        const methodValidators =
            validatorMap.get(target) ??
            validatorMap.set(target, new Map()).get(target)!;
        const paramValidators =
            methodValidators.get(key) ??
            methodValidators.set(key, []).get(key)!;
        (paramValidators[index] ?? (paramValidators[index] = [])).push(
            validator
        );
    };
}

export function time(label?: string) {
    return (
        target: Object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
    ) => {
        label ??= String(key);
        const originalFn = descriptor.value!;
        descriptor.value = function (this: any, ...args: unknown[]) {
            console.time(label);
            console.log(args);
            const res = originalFn.apply(this, args);
            if (res instanceof Promise) res.then(() => console.timeEnd(label));
            else console.timeEnd(label);
            return res;
        };
    };
}

import { ref as ref_ } from '@vue-reactivity/scope';
import type { Ref } from '@vue-reactivity/scope';

export function ref(): PropertyDecorator {
    return (target, key) => {
        let _ref: Ref<any>;
        Reflect.defineProperty(target, key, {
            get: () => _ref?.value,
            set: (value: any) => void (console.log(value, _ref),((_ref ?? (_ref = ref_())).value = value)),
            configurable: true,
            enumerable: true,
        });
    }
}
