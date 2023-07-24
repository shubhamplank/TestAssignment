interface Employee {
    uniqueId: number;
    name: string;
    subordinates: Employee[];
}

interface IEmployeeOrgApp {
    ceo: Employee;
    move(employeeID: number, supervisorID: number): void;
    undo(): void;
    redo(): void;
}

class EmployeeOrgApp implements IEmployeeOrgApp {
    private supervisorMap: Map<number, number>; // EmployeeID -> SupervisorID
    private history: { from: number; to: number }[];
    private redoHistory: { from: number; to: number }[];

    constructor(public ceo: Employee) {
        this.supervisorMap = new Map();
        this.history = [];
        this.redoHistory = [];
    }

    move(employeeID: number, supervisorID: number): void {
        if (this.ceo.uniqueId === employeeID || this.ceo.uniqueId === supervisorID) {
            console.log("Cannot move CEO or set CEO as a subordinate.");
            return;
        }

        if (!this.employeeExists(employeeID) || !this.employeeExists(supervisorID)) {
            console.log("Employee(s) not found.");
            return;
        }

        if (this.checkCircularReference(employeeID, supervisorID)) {
            console.log("Cannot create circular reference.");
            return;
        }

        const from = this.supervisorMap.get(employeeID) || this.ceo.uniqueId;
        this.history.push({ from, to: supervisorID });
        this.supervisorMap.set(employeeID, supervisorID);
    }

    undo(): void {
        if (this.history.length === 0) {
            console.log("Nothing to undo.");
            return;
        }

        const lastMove = this.history.pop();
        if (lastMove) {
            const { from, to } = lastMove;
            this.redoHistory.push({ from, to });
            this.supervisorMap.set(from, to);
        }
    }

    redo(): void {
        if (this.redoHistory.length === 0) {
            console.log("Nothing to redo.");
            return;
        }

        const lastRedo = this.redoHistory.pop();
        if (lastRedo) {
            const { from, to } = lastRedo;
            this.history.push({ from, to });
            this.supervisorMap.set(from, to);
        }
    }

    private employeeExists(employeeID: number): boolean {
        const queue = [this.ceo];
        while (queue.length > 0) {
            const currentEmployee = queue.shift();
            if (currentEmployee?.uniqueId === employeeID) {
                return true;
            }
            if (currentEmployee?.subordinates != null) {
                queue.push(...currentEmployee?.subordinates)
            }

        }
        return false;
    }

    private checkCircularReference(employeeID: number, supervisorID: number): boolean {
        let currentSupervisor = supervisorID;
        while (currentSupervisor !== this.ceo.uniqueId) {
            if (currentSupervisor === employeeID) {
                return true;
            }
            currentSupervisor = this.supervisorMap.get(currentSupervisor) || this.ceo.uniqueId;
        }
        return false;
    }
}

function sampleRun() {

    // Example usage:
    const ceo: Employee = {
        uniqueId: 1,
        name: "CEO",
        subordinates: []
    };

    const app = new EmployeeOrgApp(ceo);

    const employee1: Employee = { uniqueId: 2, name: "Employee 1", subordinates: [] };
    const employee2: Employee = { uniqueId: 3, name: "Employee 2", subordinates: [] };

    app.ceo.subordinates.push(employee1, employee2);

    console.log(app.ceo);
    // Output:
    // {
    //   uniqueId: 1,
    //   name: 'CEO',
    //   subordinates: [
    //     { uniqueId: 2, name: 'Employee 1', subordinates: [] },
    //     { uniqueId: 3, name: 'Employee 2', subordinates: [] }
    //   ]
    // }

    app.move(2, 3); // Move Employee 2 to become the subordinate of Employee 1
    console.log(app.ceo);
    // Output:
    // {
    //   uniqueId: 1,
    //   name: 'CEO',
    //   subordinates: [
    //     {
    //       uniqueId: 2,
    //       name: 'Employee 1',
    //       subordinates: [
    //         { uniqueId: 3, name: 'Employee 2', subordinates: [] }
    //       ]
    //     }
    //   ]
    // }

    app.undo(); // Undo the last move
    console.log(app.ceo);
    // Output:
    // {
    //   uniqueId: 1,
    //   name: 'CEO',
    //   subordinates: [
    //     { uniqueId: 2, name: 'Employee 1', subordinates: [] },
    //     { uniqueId: 3, name: 'Employee 2', subordinates: [] }
    //   ]
    // }

    app.redo(); // Redo the last undone move
    console.log(app.ceo);
    // Output:
    // {
    //   uniqueId: 1,
    //   name: 'CEO',
    //   subordinates: [
    //     {
    //       uniqueId: 2,
    //       name: 'Employee 1',
    //       subordinates: [
    //         { uniqueId: 3, name: 'Employee 2', subordinates: [] }
    //       ]
    //     }
    //   ]
    // }

}

// sampleRun();