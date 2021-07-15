import "reflect-metadata";
import { mix } from "ts-mixer";
import { time, validate, validatorDecoratorFactory } from "./decorators";

// window.onload =
() => {
    abstract class CanSwim {
        swim() {
            console.log("I can swim");
        }
    }
    abstract class CanFly {
        fly() {
            console.log("I can fly");
        }
    }

    @mix(CanSwim, CanFly)
    class Duck {}
    // class Duck extends CanFly, CanFly {}

    interface Duck extends CanSwim, CanFly {}

    const duck = new Duck();
    duck.swim();
    duck.fly();
};

// window.onload =
() => {
    class Foo {
        @time()
        foo() {
            for (let i = 0; i < 1e9; i++) {}
            return 42;
        }
    }
    // new Foo().foo('a' ,1, 2,3);
};

// window.onload =
() => {
    const isNumber = validatorDecoratorFactory({
        validate: (x) => typeof x === "number",
    });
    const isString = validatorDecoratorFactory({
        validate: (x) => typeof x === "string",
    });
    const isSmall = validatorDecoratorFactory({
        validate: (x: number) => x < 50,
    });

    class Bar {
        @validate()
        bar(
            @isNumber
            x: // @isSmall
            number
        ) {
            console.log(x);
        }
        @validate()
        bar2(
            @isNumber
            n: number,
            @isString
            s: string
        ) {
            console.log(n, s);
        }
    }

    const bar = new Bar();

    bar.bar(40); // works
    // bar.bar("42"); // fails
    // bar.bar(52); // fails
    bar.bar2(12, "12"); // works
    // bar.bar2("12", 12); // fails
};

// window.onload =
() => {
    class Bar {
        @validate.auto()
        bar(n: number, s: string) {
            console.log(n, s);
        }
        @validate.auto()
        bar1(n: Date) {
            console.log(n);
        }
    }

    const bar = new Bar();

    bar.bar(12, "12"); // works
    // bar.bar("12", 12); // fails
    bar.bar1(new Date()); // works
    // bar.bar1({}); // fails
};
