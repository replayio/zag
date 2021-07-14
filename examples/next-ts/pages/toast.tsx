import { useActor, useMachine } from "@ui-machines/react"
import {
  toastsMachine,
  ToastMachine,
  connectToastMachine,
} from "@ui-machines/dom"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useRef } from "react"
import { BeatLoader } from "react-spinners"

const backgrounds = {
  error: "red",
  blank: "lightgray",
  warning: "orange",
  loading: "pink",
} as any

const Toast = ({ actor }: { actor: ToastMachine }) => {
  const [state, send] = useActor(actor)
  const ctx = state.context
  return (
    <pre
      style={{ padding: 10, background: backgrounds[ctx.type] }}
      onPointerEnter={() => {
        send("PAUSE")
      }}
      onPointerLeave={() => {
        send("RESUME")
      }}
    >
      <progress max={ctx.progress?.max} value={ctx.progress?.value} />
      <p>{ctx.title}</p>
      <p>
        {ctx.type} {ctx.type === "loading" ? <BeatLoader /> : null}
      </p>
      <p>{String(ctx.duration)}</p>
      <StateVisualizer
        state={state}
        reset
        style={{ display: "inline-block" }}
      />
      <button onClick={() => send("DISMISS")}>Close</button>
    </pre>
  )
}

function Page() {
  const [state, send] = useMachine(toastsMachine)
  const { context: ctx } = state

  const ref = useMount<HTMLDivElement>(send)
  const toasts = connectToastMachine(state, send)

  const id = useRef<string>()

  return (
    <div className="App" ref={ref}>
      <button
        onClick={() => {
          id.current = toasts.create({
            title: "Welcome",
            description: "Welcome",
            type: "blank",
          })
        }}
      >
        Notify
      </button>
      <button
        onClick={() => {
          if (!id.current) return
          toasts.update(id.current, {
            title: "Testing",
            type: "loading",
          })
        }}
      >
        Update Child
      </button>
      <button onClick={() => toasts.dismiss()}>Close all</button>
      <button onClick={() => toasts.pause()}>Pause</button>
      <div>
        {ctx.toasts.map((actor) => (
          <Toast key={actor.id} actor={actor} />
        ))}
      </div>
    </div>
  )
}

export default Page