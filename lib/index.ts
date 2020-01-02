import { Model, ModelOptions, QueryContext } from 'objection'
import bcryptjs from 'bcryptjs'

interface Configuration {
  allowEmptyPassword?: boolean;
  passwordField?: string;
  rounds?: number;
}

interface Options {
  allowEmptyPassword: boolean;
  passwordField: string;
  rounds: number;
}

const DEFAULT_OPTIONS: Options = {
  allowEmptyPassword: false,
  passwordField: 'password',
  rounds: 10
}

export default function objectionPassword (
  configuration: Configuration = {}
): Function {
  const options: Options = Object.assign({}, DEFAULT_OPTIONS, configuration)

  return (ModelClass: typeof Model) => {
    return class extends ModelClass {
      /**
       * Compares a password to a bcrypt hash
       */
      public async verifyPassword (password: string): Promise<boolean> {
        const hash = this.getPasswordHash()
        if (hash) return bcryptjs.compare(password, hash)
        throw Error('Error getting hash')
      }

      public async $beforeInsert (context: QueryContext) {
        await super.$beforeInsert(context)

        return this.generateHash()
      }

      public async $beforeUpdate (
        opt: ModelOptions,
        queryContext: QueryContext
      ) {
        await super.$beforeUpdate(opt, queryContext)

        if (opt.patch && this.getPasswordHash() === undefined) {
          return
        }

        return this.generateHash()
      }

      private isBcryptHash (str: string) {
        const BCRYPT_REGEXP = /^\$2[ayb]\$.{56}$/
        return BCRYPT_REGEXP.test(str)
      }

      /**
       * Generates an bcrypt hash
       */
      private async generateHash () {
        const password = this.getPasswordHash()

        if (password && password.length > 0) {
          if (this.isBcryptHash(password)) {
            throw new Error('Bcrypt tried to hash another Bcrypt hash')
          }

          const hash = await bcryptjs.hash(password, options.rounds)
          this.setPasswordHash(hash)
          return
        }

        if (!options.allowEmptyPassword) {
          throw new Error('password must not be empty')
        }
      }

      private setPasswordHash (hash: string) {
        // @ts-ignore
        this[options.passwordField] = hash
      }

      private getPasswordHash (): string | null | undefined {
        // @ts-ignore
        return this[options.passwordField]
      }
    }
  }
}
