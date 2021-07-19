import 'dayjs'

declare module '*.svg' {
  const content: any
  export default content
}

declare module 'dayjs' {
  interface Dayjs {
    utc()
  }
}
