export const deadlinesSchema = {
  resource: 'deadlines',
  component: 'deadlines',
  description: 'Reporter deadline management and notification workflows.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/deadlines',
      description: 'List deadlines with optional status filtering.',
      queryParams: {
        status: { type: 'string', description: 'Deadline status (pending, overdue, delivered).' },
        limit: { type: 'number', description: 'Page size (default 10).' },
        page: { type: 'number', description: 'Page number (default 1).' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/deadlines',
      description: 'Create a deadline.',
      input: {
        name: { type: 'string', required: true, description: 'Deadline display name.' },
        type: { type: 'string', required: true, description: 'Deadline type.' },
        color: { type: 'string', required: true, description: 'Color code for display.' },
        dueDate: { type: 'string', required: true, description: 'Due date timestamp.' },
        frequency: { type: 'string', required: true, description: 'Frequency (monthly, annual, etc.).' },
        description: { type: 'string', required: false, description: 'Optional description.' },
        notifyDaysBefore: { type: 'number', required: false, description: 'Notification window in days.' },
        templateId: { type: 'string', required: false, description: 'Optional template UUID.' },
        monthsOfYear: { type: 'array', required: false, description: 'Applicable months of year.' }
      }
    },
    listNotifications: {
      method: 'GET',
      path: '/v1/deadlines/notifications',
      description: 'List deadlines within their notification window.',
      queryParams: {
        limit: { type: 'number', description: 'Maximum number of notifications (1-100).' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/deadlines/:id',
      description: 'Update a deadline by ID.',
      pathParams: {
        id: { type: 'string', required: true, description: 'Deadline UUID.' }
      },
      input: {
        active: { type: 'boolean', required: false, description: 'Whether the deadline is active.' },
        name: { type: 'string', required: false, description: 'Updated name.' },
        type: { type: 'string', required: false, description: 'Updated type.' },
        color: { type: 'string', required: false, description: 'Updated color.' },
        dueDate: { type: 'string', required: false, description: 'Updated due date.' },
        frequency: { type: 'string', required: false, description: 'Updated frequency.' },
        description: { type: 'string', required: false, description: 'Updated description.' },
        notifyDaysBefore: { type: 'number', required: false, description: 'Updated notification window.' },
        templateId: { type: 'string', required: false, description: 'Updated template UUID.' },
        monthsOfYear: { type: 'array', required: false, description: 'Updated months of year.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/deadlines/:id',
      description: 'Delete a deadline by ID.',
      pathParams: {
        id: { type: 'string', required: true, description: 'Deadline UUID.' }
      }
    },
    deliver: {
      method: 'PATCH',
      path: '/v1/deadlines/:id/deliver',
      description: 'Mark a deadline as delivered or not delivered.',
      pathParams: {
        id: { type: 'string', required: true, description: 'Deadline UUID.' }
      },
      input: {
        delivered: { type: 'boolean', required: true, description: 'Delivery flag.' }
      }
    }
  }
};
