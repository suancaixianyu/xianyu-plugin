import React, { PropsWithChildren } from 'react'
import css_output from '@src/asstes/main.css'
export default function Html({ children }: PropsWithChildren) {
  return (
    <html>
      <head>
        <link rel="stylesheet" href={css_output} />
      </head>
      <body>{children}</body>
    </html>
  )
}
