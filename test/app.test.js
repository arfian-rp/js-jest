const sum = require("../src/sum");
const axios = require("axios");
const Users = require("../src/users");

jest.mock("axios");

//Mocking Partials
const { foo, bar } = require("../src/foo-bar-baz");
const { diff } = require("jest-diff");
const { getType } = require("jest-get-type");

// import defaultExport, {bar, foo} from '../foo-bar-baz';
// jest.mock('../foo-bar-baz', () => {
//   const originalModule = jest.requireActual('../foo-bar-baz');
//   //Mock the default export and named export 'foo'
//   return {
//     __esModule: true,
//     ...originalModule,
//     default: jest.fn(() => 'mocked baz'),
//     foo: 'mocked foo',
//   };
// });
jest.mock("./src/foo-bar-baz.js", () => {
  return {
    __esModule: true,
    foo: "mocked foo",
    bar: () => "bar",
  };
});

//Using Matchers
describe("Using Matchers", () => {
  //Common Matchers
  describe("Common Matchers", () => {
    test("adds 1 + 2 to equal 3", () => {
      expect(sum(1, 2)).toBe(3); //toBe uses Object.is
    });

    test("object assignment", () => {
      const data = { one: 1 };
      data["two"] = 2;
      //to check the value of an object
      expect(data).toEqual({ one: 1, two: 2 });
    });
    test("adding positive numbers is not zero", () => {
      for (let a = 1; a < 10; a++) {
        for (let b = 1; b < 10; b++) {
          //opposite of a matcher
          expect(a + b).not.toBe(0);
        }
      }
    });
  });

  //Truthiness
  describe("Truthiness", () => {
    // toBeNull matches only null
    // toBeUndefined matches only undefined
    // toBeDefined is the opposite of toBeUndefined
    // toBeTruthy matches anything that an if statement treats as true
    // toBeFalsy matches anything that an if statement treats as false
    test("null", () => {
      const n = null;
      expect(n).toBeNull();
      expect(n).toBeDefined();
      expect(n).not.toBeUndefined();
      expect(n).not.toBeTruthy();
      expect(n).toBeFalsy();
    });
    test("zero", () => {
      const z = 0;
      expect(z).not.toBeNull();
      expect(z).toBeDefined();
      expect(z).not.toBeUndefined();
      expect(z).not.toBeTruthy();
      expect(z).toBeFalsy();
    });
  });

  //Number
  describe("Number", () => {
    test("two plus two", () => {
      const value = 2 + 2;
      expect(value).toBeGreaterThan(3);
      expect(value).toBeGreaterThanOrEqual(3.5);
      expect(value).toBeLessThan(5);
      expect(value).toBeLessThanOrEqual(4.5);

      // toBe and toEqual are equivalent for numbers
      expect(value).toBe(4);
      expect(value).toEqual(4);
    });
    test("adding floating point numbers", () => {
      const value = 0.1 + 0.2;
      // expect(value).toBe(0.3); //  This won't work because of rounding error
      expect(value).toBeCloseTo(0.3); // This works.
    });
  });

  //Strings
  describe("Strings", () => {
    test("there is no I in team", () => {
      expect("team").not.toMatch(/I/);
    });
    test('but there is a "stop" in Christoph', () => {
      expect("Christoph").toMatch(/stop/);
    });
  });

  //Arrays and iterables
  describe("Arrays and iterables", () => {
    const shoppingList = ["diapers", "kleenex", "trash bags", "paper towels", "milk"];
    test("the shopping list has milk on it", () => {
      expect(shoppingList).toContain("milk");
      expect(new Set(shoppingList)).toContain("milk");
    });
  });

  //Exceptions
  describe("Exceptions", () => {
    function compileAndroidCode() {
      throw new Error("you are using the wrong JDK");
    }
    test("compiling android goes as expected", () => {
      expect(() => compileAndroidCode()).toThrow();
      expect(() => compileAndroidCode()).toThrow(Error);
      // You can also use the exact error message or a regexp
      expect(() => compileAndroidCode()).toThrow("you are using the wrong JDK");
      expect(() => compileAndroidCode()).toThrow(/JDK/);
    });
  });

  //Testing Asynchronous Code
  describe("Testing Asynchronous Code", () => {
    function fetchData(kondisi = true, callback) {
      if (callback) {
        if (kondisi) callback(false, "peanut butter");
        else callback("error", false);
      } else {
        return new Promise((res, rej) => {
          if (kondisi) res("peanut butter");
          else rej("error");
        });
      }
    }
    test("the data is peanut butter", () => {
      return fetchData().then((data) => {
        expect(data).toBe("peanut butter");
      });
    });
    //Async/Await
    describe("Async/Await", () => {
      test("the data is peanut butter", async () => {
        const data = await fetchData();
        expect(data).toBe("peanut butter");
      });
      test("the fetch fails with an error", async () => {
        expect.assertions(1);
        try {
          await fetchData(false);
        } catch (e) {
          expect(e).toMatch("error");
        }
      });
      //You can combine async and await with .resolves or .rejects.
      test("the data is peanut butter", async () => {
        await expect(fetchData()).resolves.toBe("peanut butter");
      });
      test("the fetch fails with an error", async () => {
        await expect(fetchData(false)).rejects.toMatch("error");
      });
      //If you expect a promise to be rejected, use the .catch method. Make sure to add expect.assertions to verify that a certain number of assertions are called. Otherwise, a fulfilled promise would not fail the test.
      test("the fetch fails with an error", () => {
        expect.assertions(1);
        return fetchData(false).catch((e) => expect(e).toMatch("error"));
      });
    });

    //Callbacks
    describe("Callbacks", () => {
      test("the data is peanut butter", (done) => {
        function callback(error, data) {
          if (error) {
            done(error);
            return;
          }
          try {
            expect(data).toBe("peanut butter");
            done();
          } catch (error) {
            done(error);
          }
        }

        fetchData(true, callback);
      });
      //.resolves / .rejects
      test("the data is peanut butter", () => {
        return expect(fetchData()).resolves.toBe("peanut butter");
      });
      test("the fetch fails with an error", () => {
        return expect(fetchData(false)).rejects.toMatch("error");
      });
    });
  });
});

//Setup and Teardown
describe("Setup and Teardown", () => {
  //Repeating Setup For Many Tests
  describe("Repeating Setup For Many Tests", () => {
    beforeEach(() => {
      console.info("beforeEach");
    });
    afterEach(() => {
      console.info("afterEach");
    });
    // beforeEach and afterEach can handle asynchronous
    // code in the same ways that tests can handle asynchronous code
    //they can either take a done parameter or return a promise.
    //For example, if initializeCityDatabase() returned a promise that resolved when the database was initialized,
    //we would want to return that promise:
    beforeAll(() => {
      return console.info("beforeEach");
    });
    afterAll(() => {
      return console.info("afterEach");
    });
    test("city database has Vienna", () => {
      expect("Vienna").toBeTruthy();
    });
    test("city database has San Juan", () => {
      expect("San Juan").toBeTruthy();
    });
  });

  // beforeAll(() => console.log("1 - beforeAll"));
  // afterAll(() => console.log("1 - afterAll"));
  // beforeEach(() => console.log("1 - beforeEach"));
  // afterEach(() => console.log("1 - afterEach"));
  // test("", () => console.log("1 - test"));
  // describe("Scoped / Nested block", () => {
  //   beforeAll(() => console.log("2 - beforeAll"));
  //   afterAll(() => console.log("2 - afterAll"));
  //   beforeEach(() => console.log("2 - beforeEach"));
  //   afterEach(() => console.log("2 - afterEach"));
  //   test("", () => console.log("2 - test"));
  // });
  // 1 - beforeAll
  // 1 - beforeEach
  // 1 - test
  // 1 - afterEach
  // 2 - beforeAll
  // 1 - beforeEach
  // 2 - beforeEach
  // 2 - test
  // 2 - afterEach
  // 1 - afterEach
  // 2 - afterAll
  // 1 - afterAll

  //General Advice
  describe("General Advice", () => {
    test.only("this will be the only test that runs", () => {
      expect(true).toBe(false);
    });

    test.skip("this will be skip", () => {
      expect(true).toBe(false);
    });

    test("this test will not run", () => {
      expect("A").toBe("A");
    });
  });
});

//Mock Functions
describe("Mock Functions", () => {
  describe("Using a mock function", () => {
    function forEach(items, callback) {
      for (let i = 0; i < items.length; i++) {
        callback(items[i]);
      }
    }

    const mockCallback = jest.fn((x) => 42 + x);
    forEach([0, 1], mockCallback);

    test("The mock function is called twice", () => {
      expect(mockCallback.mock.calls.length).toBe(2);
      expect(mockCallback.mock.instances.length).toBe(2);
    });

    test("The first argument of the first call to the function was 0", () => {
      //arg 1 => call first, arg 2 => arg first
      expect(mockCallback.mock.calls[0][0]).toBe(0);
    });

    test("The first argument of the second call to the function was 1", () => {
      expect(mockCallback.mock.calls[1][0]).toBe(1);
    });

    test("The return value of the first call to the function was 42", () => {
      expect(mockCallback.mock.results[0].value).toBe(42);
    });
  });

  describe("Mock Return Values", () => {
    const myMock1 = jest.fn();
    myMock1.mockReturnValue(12);
    expect(myMock1()).toBe(12);
    expect(myMock1()).toBe(12);

    const myMock2 = jest.fn();
    myMock2.mockReturnValueOnce(10).mockReturnValueOnce("hello");
    expect(myMock2()).toBe(10);
    expect(myMock2()).not.toBe(10); //> 'hello'
    expect(myMock2()).toBeUndefined();

    test("Make the mock return `true` for the first call and `false` for the second call", () => {
      const filterTestFn = jest.fn();
      filterTestFn.mockReturnValueOnce(true).mockReturnValueOnce(false);
      const result = [1, 2].filter((e) => filterTestFn(e));

      expect(result).toEqual([1]);
      expect(filterTestFn.mock.results[0].value).toBe(true); //return value in first call is true
      expect(filterTestFn.mock.calls[0][0]).toBe(1); //arg is 1
      expect(filterTestFn.mock.calls[1][0]).toBe(2);
    });
  });

  describe("Mocking Modules", () => {
    test("should fetch users", () => {
      const users = [{ name: "Bob" }];
      const resp = { data: users };
      axios.get.mockResolvedValue(resp);

      return Users.all().then((data) => expect(data).toEqual(users));
    });
  });

  describe("Mocking Partials", () => {
    test("should do a partial mock", () => {
      expect(foo).toBe("mocked foo");
      expect(bar()).toBe("bar");
    });
  });

  describe("Mock Implementations", () => {
    test("Should be true", () => {
      const myMock = jest.fn((cb) => cb(null, true));
      myMock((e, v) => expect(v).toBe(true));
    });

    test("mockImplementation", () => {
      const foo = require("../src/foo");
      jest.mock("./src/foo");

      foo.mockImplementation(() => 42);
      expect(foo()).toEqual(42);
    });

    test("mockImplementationOnce", () => {
      const myMock = jest
        .fn((cb) => cb("default"))
        .mockImplementationOnce((cb) => cb(true))
        .mockImplementationOnce((cb) => cb(false));

      myMock((r) => expect(r).toBe(true));
      myMock((r) => expect(r).toBe(false));
      myMock((r) => expect(r).toBe("default"));
      myMock((r) => expect(r).toBe("default"));
      myMock((r) => expect(r).toBe("default"));
    });

    test("mockReturnThis", () => {
      const myObj = {
        myMethod: jest.fn().mockReturnThis(),
      };

      //same as
      const other = {
        myMethod: jest.fn(() => this),
      };
    });

    test("Mock Names", () => {
      const myMockFn = jest
        .fn()
        .mockReturnValue("default")
        .mockImplementation((x) => x + 42)
        .mockName("add42");

      expect(myMockFn(1)).toBe(43);
    });

    test("Custom Matchers", () => {
      const mockFunc = jest.fn(() => 1).mockName("mock Func");
      mockFunc(33, 33);
      mockFunc(4, 4);
      expect(mockFunc).toHaveBeenCalled();
      expect(mockFunc).toHaveBeenCalledWith(33, 33);
      expect(mockFunc).toHaveBeenCalledTimes(2);
      expect(mockFunc).toMatchSnapshot();

      //Manually
      expect(mockFunc.mock.calls.length).toBeGreaterThan(1);
      expect(mockFunc.mock.calls).toEqual([
        [33, 33],
        [4, 4],
      ]);
      expect(mockFunc.mock.calls[0]).toEqual([33, 33]);
      expect(mockFunc.mock.calls[1][0]).toEqual(4);
      expect(mockFunc.getMockName()).toBe("mock Func");
    });
  });
});

describe("Jest Platform", () => {
  describe("jest-diff", () => {
    test("should be !same", () => {
      const a = { a: { b: { c: { d: { e: { f: 14 } } } } } };
      const b = { a: { b: { c: { d: { e: { f: 14 } } } } } };
      expect(a).toEqual(b);
      console.info(diff(a, b));
    });
  });

  describe("jest-get-type", () => {
    const array = [1, 2, 3];
    const nullValue = null;
    const undefinedValue = undefined;
    console.info(getType(array));
    console.info(getType(nullValue));
    console.info(getType(undefinedValue));
  });
});
