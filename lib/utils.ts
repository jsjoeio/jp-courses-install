import {
  ERROR_MESSAGE_TEMPLATE,
  INVALID_PAYMENT_ID_VALUE,
  MISSING_PAYMENT_ID_VALUE,
  UNSUPPORTED_ARG,
} from "./constants.ts";
import {
  Args,
  PaymentId,
  ScriptFlagsAndArgs,
  VerifyPurchase,
} from "./types.d.ts";
/**
 * Logs an error message using the ERROR_MESSAGE_TEMPLATE
 * and the message passed in
 */
export function logErrorMessage(msg: string): void {
  console.error(`${ERROR_MESSAGE_TEMPLATE} ${msg}`);
}

/**
 * Exits the script with exit code 1
 */
export function exitScriptWithError() {
  Deno.exit(1);
}

/**
 * Exits the script with exit code 0
 */
export function exitScriptWithSuccess() {
  Deno.exit(0);
}

export function handleArgs(args: Args[]): ScriptFlagsAndArgs {
  const scriptFlagsAndArgs: ScriptFlagsAndArgs = {
    flagsEnabled: {
      help: false,
      dryRun: false,
    },
    argsPassed: {
      paymentId: "",
    },
    errors: [],
  };

  // This is a label for the loop
  // we do this so that we can break the outerLoop
  // from inside the switch statement
  // See: https://stackoverflow.com/questions/17072605/break-for-loop-from-inside-of-switch-case-in-javascript
  //
  outerLoop:
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    switch (arg) {
      /*
        We check for the -h/--help flag first
        because we ignore all the other flags
        print the message and exit the script.
      */
      case "-h":
      case "--help":
        scriptFlagsAndArgs.flagsEnabled.help = true;
        break outerLoop;
      case "-i":
      case "--payment-id":
      case "--paymentId": {
        if (!hasNextArg(args, index)) {
          const errorMessage = MISSING_PAYMENT_ID_VALUE(arg);
          scriptFlagsAndArgs.errors.push(errorMessage);
          break outerLoop;
        }

        const paymentId = args[index + 1];
        const isValid = isValidPaymentIdValue(paymentId);
        if (!isValid) {
          const errorMessage = INVALID_PAYMENT_ID_VALUE(paymentId);
          scriptFlagsAndArgs.errors.push(errorMessage);
          break outerLoop;
        }

        scriptFlagsAndArgs.argsPassed.paymentId = paymentId;
        break;
      }

      default: {
        // Since paymentIdValue is a string
        // we can't write a specific case for it
        // but we can check here and break if it's found
        const isPaymentId = isValidPaymentIdValue(arg);
        if (isPaymentId) {
          break;
        }

        // Otherwise, it's probably and unsupported flag
        const unsupportedArgMessage = UNSUPPORTED_ARG(arg);
        scriptFlagsAndArgs.errors.push(unsupportedArgMessage);
        break outerLoop;
      }
    }
  }

  return scriptFlagsAndArgs;
}

export function hasNextArg(arr: Args[], currentIndex: number): boolean {
  const nextIndex = currentIndex + 1;

  if (arr[nextIndex]) {
    return true;
  }
  return false;
}

export function isValidPaymentIdValue(value: string): boolean {
  const pattern = /cs_live_[a-zA-Z0-9]+/g;
  const regex = new RegExp(pattern);

  return regex.test(value);
}

export function verifyPurchase(paymentId: PaymentId): VerifyPurchase {
  const verifiedPurchase: VerifyPurchase = {
    verified: false,
    downloadLink: "",
    error: "mesage",
  };

  // TODO
  // verify paymentId
  return verifiedPurchase;
}
