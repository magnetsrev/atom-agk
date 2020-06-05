'use babel'
import { CompositeDisposable } from 'atom'
import Debugger from '../../lib/debugger/debugger'
import Runner from '../../lib/debugger/runner'
import Process from '../../lib/process'
import Compiler from '../../lib/compiler'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'
import DebuggerView from '../../lib/debugger/debugger_view'

describe('Debugger', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-debugger to .toggleDebuggerWindow', () => {
      const disposables = new CompositeDisposable()
      const debugManager = new Debugger({ subscriptions: disposables })
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(debugManager, 'toggleDebuggerWindow')

      atom.commands.dispatch(workspaceElement, 'atom-agk:toggle-debugger')

      expect(debugManager.toggleDebuggerWindow).toHaveBeenCalled()
    })

    it('binds "atom-agk:debug" to .debug', () => {
      const disposables = new CompositeDisposable()
      const debugManager = new Debugger({ subscriptions: disposables })
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(debugManager, 'debug')

      atom.commands.dispatch(workspaceElement, 'atom-agk:debug')

      expect(debugManager.debug).toHaveBeenCalled()
    })
  })

  describe('.debug', () => {
    it('starts the runner', () => {
      const disposables = new CompositeDisposable()
      const process = Process.null()
      const compiler = new Compiler({ subscriptions: disposables, process })
      const breakpoints = new BreakpointManager(disposables)
      const runner = new Runner({ breakpoints })
      const debugManager = new Debugger({ subscriptions: disposables, compiler, runner })
      spyOn(runner, 'start')

      waitsForPromise(() => atom.workspace.open('foo.agc'))
      waitsForPromise(() => debugManager.debug())

      runs(() => {
        expect(runner.start).toHaveBeenCalled()
      })
    })
  })

  it('opens the view on atom://agk-debugger', () => {
    const disposables = new CompositeDisposable()
    const view = new DebuggerView()
    new Debugger({ subscriptions: disposables, view: view })
    spyOn(view, 'getDefaultLocation')

    waitsForPromise(() => atom.workspace.open(view.getURI()))
    runs(() => expect(view.getDefaultLocation).toHaveBeenCalled())
  })

  it('sends watch to runner on view.onCommandEntered', () => {
    const disposables = new CompositeDisposable()
    const breakpoints = new BreakpointManager(disposables)
    const runner = new Runner({ breakpoints })
    const view = new DebuggerView()
    new Debugger({ subscriptions: disposables, runner: runner, view: view })
    spyOn(runner, 'watch')

    view.emit('command-entered', 'foo')

    expect(runner.watch).toHaveBeenCalledWith('foo')
  })

  it('stops runner on view.onTogglePressed', () => {
    const disposables = new CompositeDisposable()
    const breakpoints = new BreakpointManager(disposables)
    const runner = new Runner({ breakpoints })
    const view = new DebuggerView()
    new Debugger({ subscriptions: disposables, runner: runner, view: view })
    spyOn(runner, 'toggle')

    view.emit('toggle-pressed')

    expect(runner.toggle).toHaveBeenCalled()
  })

  it('continues runner on view.onContinuePressed', () => {
    const disposables = new CompositeDisposable()
    const breakpoints = new BreakpointManager(disposables)
    const runner = new Runner({ breakpoints })
    const view = new DebuggerView()
    new Debugger({ subscriptions: disposables, runner: runner, view: view })
    spyOn(runner, 'continue')

    view.emit('continue-pressed')

    expect(runner.continue).toHaveBeenCalled()
  })

  it('highlights breakpoint if needed', () => {
    const disposables = new CompositeDisposable()
    const breakpoints = new BreakpointManager(disposables)
    const runner = new Runner({ breakpoints })
    const view = new DebuggerView()
    const debugManager = new Debugger({ subscriptions: disposables, runner, view })
    spyOn(debugManager, 'highlightBreakpointIfNeeded')

    runner.out('< Break:foo.agc:3 Some More Text')

    expect(debugManager.highlightBreakpointIfNeeded).toHaveBeenCalled()
  })
})
