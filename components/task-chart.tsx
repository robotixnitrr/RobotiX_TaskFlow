"use client"

import type { TaskWithTypedAssignees } from "@/db/schema"
import type React from "react"
import { useCallback, useEffect, useMemo } from "react"
import ReactFlow, {
    Background,
    Controls,
    ReactFlowProvider,
    type Node,
    type Edge,
    MiniMap,
    MarkerType,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    type Connection,
    addEdge,
    Handle,
    Position,
} from "reactflow"
import "reactflow/dist/style.css"

export type FlowTaskAssigneeData = {
    id: string
    name: string
    assignedAt: string
}

export interface FlowChartUser {
    id: number
    name: string
    email: string
    position: "overall-coordinator" | "head-coordinator" | "core-coordinator" | "executive" | "members"
}

export type FlowChartData = {
    user: FlowChartUser
    tasks: TaskWithTypedAssignees[]
}

const nodeWidth = 320
const nodeHeight = 160
const verticalSpacing = 250
const horizontalSpacing = 400

const getPositionColor = (position: string) => {
    const colors = {
        "overall-coordinator": "#dc2626",
        "head-coordinator": "#ea580c",
        "core-coordinator": "#d97706",
        executive: "#059669",
        members: "#2563eb",
    }
    return colors[position as keyof typeof colors] || "#6b7280"
}

const getPriorityColor = (priority: string) => {
    const colors = {
        high: "#dc2626",
        medium: "#ea580c",
        low: "#059669",
    }
    return colors[priority?.toLowerCase() as keyof typeof colors] || "#6b7280"
}

const getStatusColor = (status: string) => {
    const colors = {
        completed: "#059669",
        "in-progress": "#2563eb",
        pending: "#ea580c",
        overdue: "#dc2626",
    }
    return colors[status?.toLowerCase() as keyof typeof colors] || "#6b7280"
}

// Custom User Node Component
const UserNode: React.FC<{ data: any }> = ({ data }) => {
    console.log('Rendering UserNode:', data);
    return (
        <div
            className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 border-4 border-indigo-800 rounded-2xl p-4 text-white shadow-2xl"
            style={{ width: nodeWidth, height: nodeHeight }}
        >
            <Handle type="source" position={Position.Bottom} id="out-user" />

            <div className="absolute -top-2 -right-3 text-yellow-400 text-3xl animate-bounce">
                👑
            </div>

            <div className="text-center space-y-3 h-full flex flex-col justify-center">
                <div className="flex items-center justify-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
                        👤
                    </div>
                    <div className="text-xl font-bold">
                        {data.user.name}
                    </div>
                </div>

                <div className="text-sm text-blue-100">
                    📧 {data.user.email}
                </div>

                <div
                    className="inline-block text-xs font-bold px-4 py-2 rounded-full text-white border-2 border-white/50"
                    style={{ backgroundColor: `${data.positionColor}cc` }}
                >
                    🎯 {data.user.position.replace("-", " ").toUpperCase()}
                </div>
            </div>

            <div className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-pulse pointer-events-none"></div>
            <Handle type="source" position={Position.Bottom} id="out-task" />

        </div>
    )
}

// Custom Task Node Component  
const TaskNode: React.FC<{ data: any }> = ({ data }) => {
    console.log('Rendering TaskNode:', data);
    const { task, isCurrentUserAssigner, priorityColor, statusColor } = data

    return (
        <div
            className={`relative overflow-hidden rounded-xl p-4 shadow-xl border-2 ${isCurrentUserAssigner
                ? 'bg-gradient-to-br from-amber-100 to-orange-200 border-orange-400'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                }`}
            style={{ width: nodeWidth }}
        >
            <Handle type="target" position={Position.Top} id="in-task" />

            {isCurrentUserAssigner && (
                <div className="absolute -top-1 -right-2 text-blue-500 text-xl animate-pulse">
                    ⭐
                </div>
            )}

            <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                        📋
                    </div>
                    <div className="text-base font-bold text-gray-800 line-clamp-2 leading-tight flex-1">
                        {task.title}
                    </div>
                </div>

                <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed flex-1">
                    {task.description}
                </div>

                <div className="flex justify-between items-center space-x-2">
                    <span
                        className="px-3 py-1 rounded-full text-white font-semibold text-xs shadow-sm"
                        style={{ backgroundColor: priorityColor }}
                    >
                        {task.priority?.toUpperCase()}
                    </span>
                    <span
                        className="px-3 py-1 rounded-full text-white font-semibold text-xs shadow-sm"
                        style={{ backgroundColor: statusColor }}
                    >
                        {task.status?.replace('-', ' ').toUpperCase()}
                    </span>
                </div>

                <div className="text-sm text-gray-500 flex items-center justify-center space-x-2">
                    <span>⏰</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>

                {isCurrentUserAssigner && (
                    <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-center border border-blue-200">
                        👤 Assigned by you
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} id="out-task" />

        </div>
    )
}

// Custom Assignee Node Component
const AssigneeNode: React.FC<{ data: any }> = ({ data }) => {
    console.log('Rendering AssigneeNode:', data);
    const { assignee, isCurrentUser } = data

    return (
        <div
            className={`relative overflow-hidden rounded-xl p-4 shadow-lg border-2 ${isCurrentUser
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-indigo-700 text-white'
                : 'bg-gradient-to-br from-gray-50 to-gray-200 border-gray-400 text-gray-800'
                }`}
            style={{ width: nodeWidth * 0.85, height: nodeHeight * 0.7 }}
        >
            <Handle type="target" position={Position.Top} id="in-assignee" />

            {isCurrentUser && (
                <>
                    <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-bounce">
                        👑
                    </div>
                    <div className="absolute inset-0 rounded-xl border-2 border-blue-300/50 animate-pulse pointer-events-none"></div>
                </>
            )}

            <div className="text-center space-y-3 h-full flex flex-col justify-center">
                <div className="flex items-center justify-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCurrentUser
                        ? 'bg-white text-blue-600'
                        : 'bg-gray-200 text-gray-600'
                        }`}>
                        👤
                    </div>
                    <div className="font-bold text-lg">
                        {assignee.name}
                        {isCurrentUser && (
                            <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded-full">
                                (You)
                            </span>
                        )}
                    </div>
                </div>

                <div className={`text-sm ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                    🕒 Assigned on {new Date(assignee.assignedAt).toLocaleDateString()}
                </div>
                <Handle type="source" position={Position.Bottom} id="out-task" />

            </div>
        </div>
    )
}

// Define custom node types
const nodeTypes = {
    userNode: UserNode,
    taskNode: TaskNode,
    assigneeNode: AssigneeNode,
}

const UnifiedFlow: React.FC<FlowChartData> = ({ user, tasks }) => {
    console.log('Props received:', { user, tasks });
    const task3 = tasks.find(t => t.id === 3 || t.id === 3);
    console.log('Task with id 3:', task3);
    if (task3) {
        console.log('Assignees for task 3:', task3.assignees);
    }
    if (!user?.id || !tasks || !Array.isArray(tasks)) {
        console.error('Invalid props:', { user, tasks });
        return <div>Error: Invalid user or tasks data</div>;
    }

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    console.log('Current nodes:', nodes);
    console.log('Current edges:', edges);

    const onConnect = useCallback(
        (params: Connection) => setEdges(eds => addEdge(params, eds)),
        [setEdges]
    );

    // Auto-arrange nodes function
    const autoArrange = useCallback(() => {
        setNodes(nds => {
            return nds.map(node => {
                console.log('Arranging node:', node.id, node.position);
                if (node.type === 'userNode') {
                    return {
                        ...node,
                        position: {
                            x: Math.max(0, (tasks.length * horizontalSpacing) / 2 - nodeWidth / 2 + tasks.length * 20),
                            y: 50
                        }
                    };
                } else if (node.type === 'taskNode') {
                    const taskIndex = tasks.findIndex(t => t.id.toString() === node.id.split('-')[1]);
                    return {
                        ...node,
                        position: {
                            x: (taskIndex) * horizontalSpacing + 100,
                            y: 350
                        }
                    };
                } else if (node.type === 'assigneeNode') {
                    const parts = node.id.split('-');
                    const taskId = parts[1];
                    const assigneeId = parts[3];
                    const taskIndex = tasks.findIndex(t => t.id.toString() === taskId);
                    const task = tasks.find(t => t.id.toString() === taskId);
                    const assigneeIndex = task?.assignees.findIndex(a => a.id.toString() === assigneeId) || 0;
                    return {
                        ...node,
                        position: {
                            x: taskIndex * horizontalSpacing + 100,
                            y: 650 + (assigneeIndex * 200)
                        }
                    };
                }
                return node;
            });
        });
    }, [setNodes, tasks]);

    // Generate nodes and edges
    const { initialNodes, initialEdges } = useMemo(() => {
        const tempNodes: Node[] = [];
        const tempEdges: Edge[] = [];

        // Validate user ID
        if (!user.id) {
            console.error('Invalid user ID:', user);
            return { initialNodes: [], initialEdges: [] };
        }

        // User node
        const userNodeId = `user-${String(user.id)}`;
        const positionColor = getPositionColor(user.position);

        tempNodes.push({
            id: userNodeId,
            type: 'userNode',
            data: { user, positionColor },
            position: {
                x: Math.max(0, (tasks.length * horizontalSpacing) / 2 - nodeWidth / 2 + tasks.length * 20),
                y: 50
            },
            draggable: true,
        });

        // Task nodes and assignee nodes
        tasks.forEach((task, taskIndex) => {
            if (!task.id) {
                console.error('Invalid task ID:', task);
                return;
            }

            const taskX = taskIndex * horizontalSpacing + 100;
            const taskY = 350;
            const taskNodeId = `task-${String(task.id)}`;
            const priorityColor = getPriorityColor(task.priority);
            const statusColor = getStatusColor(task.status);
            const isCurrentUserAssigner = task.assignerId === user.id;

            // Task node
            tempNodes.push({
                id: taskNodeId,
                type: 'taskNode',
                data: {
                    task,
                    isCurrentUserAssigner,
                    priorityColor,
                    statusColor
                },
                position: { x: taskX, y: taskY },
                draggable: true,
            });

            // User to Task edge
            tempEdges.push({
                id: `user-task-${userNodeId}-${taskNodeId}`,
                source: userNodeId,
                target: taskNodeId,
                type: "smoothstep",
                animated: true,
                style: {
                    stroke: isCurrentUserAssigner ? "#f59e0b" : "#4c51bf",
                    strokeWidth: 4,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isCurrentUserAssigner ? "#f59e0b" : "#4c51bf",
                    width: 12,
                    height: 20,
                },
            });

            // Assignee nodes and edges
            if (task.assignees && task.assignees.length > 0) {
                const sortedAssignees = [...task.assignees].sort(
                    (a, b) => new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime(),
                );

                sortedAssignees.forEach((assignee, idx) => {
                    if (!assignee.id) {
                        console.error('Invalid assignee ID:', assignee);
                        return;
                    }

                    const assigneeNodeId = `task-${String(task.id)}-assignee-${String(assignee.id)}`;
                    const assigneeY = 650 + (idx * 200);
                    const isCurrentUser = assignee.name === user.name || assignee.id === user.id;

                    // Assignee node
                    tempNodes.push({
                        id: assigneeNodeId,
                        type: 'assigneeNode',
                        data: { assignee, isCurrentUser },
                        position: { x: taskX, y: assigneeY },
                        draggable: true,
                    });

                    // Task to first assignee edge
                    if (idx === 0) {
                        console.log('Creating edge:', {
                            id: `task-assignee-${taskNodeId}-${assigneeNodeId}`,
                            source: taskNodeId,
                            target: assigneeNodeId
                        });
                        tempEdges.push({
                            id: `task-assignee-${taskNodeId}-${assigneeNodeId}`,
                            source: taskNodeId,
                            target: assigneeNodeId,
                            type: "default",
                            animated: true,
                            style: {
                                stroke: isCurrentUser ? "#3b82f6" : "#ea580c",
                                strokeWidth: isCurrentUser ? 4 : 3,
                                strokeDasharray: "8,5",
                            },
                            markerEnd: {
                                type: MarkerType.Arrow,
                                color: isCurrentUser ? "#3b82f6" : "#ea580c",
                                width: 15,
                                height: 18,
                            },
                        });
                        delete (tempEdges as any).sourceHandle;
                        delete (tempEdges as any).targetHandle;
                    } else {
                        // Assignee to assignee edges (chain)
                        const previousAssigneeNodeId = `task-${String(task.id)}-assignee-${String(sortedAssignees[idx - 1].id)}`;
                        tempEdges.push({
                            id: `assignee-chain-${previousAssigneeNodeId}-${assigneeNodeId}`,
                            source: previousAssigneeNodeId,
                            target: assigneeNodeId,
                            type: "default",
                            style: {
                                stroke: isCurrentUser ? "#3b82f6" : "#7c3aed",
                                strokeWidth: isCurrentUser ? 2 : 2,
                            },
                            markerEnd: {
                                type: MarkerType.Arrow,
                                color: isCurrentUser ? "#3b82f6" : "#7c3aed",
                                width: 16,
                                height: 16,
                            },
                        });
                    }
                });
            }
        });

        // Validate edges
        const nodeIds = new Set(tempNodes.map(node => node.id));
        const validEdges = tempEdges.filter(edge => {
            const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
            if (!isValid) {
                console.warn('Invalid edge:', edge);
            }
            return isValid;
        });

        console.log('Nodes:', tempNodes);
        console.log('Edges:', validEdges);
        console.log('Task node task-3:', tempNodes.find(n => n.id === 'task-3'));
        console.log('Assignee node task-3-assignee-2:', tempNodes.find(n => n.id === 'task-3-assignee-2'));
        console.log('Edge task-assignee-task-3-task-3-assignee-2:', validEdges.find(e => e.id === 'task-assignee-task-3-task-3-assignee-2'));

        return { initialNodes: tempNodes, initialEdges: validEdges };
    }, [user, tasks]);

    // Set initial nodes and edges
    useEffect(() => {
        console.log('Setting nodes:', initialNodes);
        console.log('Setting edges:', initialEdges);
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20">
                <button
                    onClick={autoArrange}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                    <span>🔄</span>
                    <span>Auto Arrange</span>
                </button>
            </div>

            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                    className="bg-transparent"
                    fitViewOptions={{ padding: 0.3 }}
                    nodesDraggable={true}
                    nodesConnectable={true}
                    elementsSelectable={true}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
                    minZoom={0.3}
                    maxZoom={1.5}
                    deleteKeyCode={null}
                    multiSelectionKeyCode={null}
                    style={{ height: '100%', width: '100%' }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={25}
                        size={2}
                        color="var(--dot-color)"
                        className=" bg-white dark:bg-black [--dot-color:#cbd5e1] dark:[--dot-color:#4b5563]"
                    />
                    <Controls
                        className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl border border-white/20"
                        showInteractive={false}
                    />
                    <MiniMap
                        className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl border border-white/20"
                        nodeColor={(node) => {
                            if (node.type === 'userNode') return "#4c51bf"
                            if (node.type === 'taskNode') return "#ea580c"
                            if (node.type === 'assigneeNode') return "#3b82f6"
                            return "#6b7280"
                        }}
                        maskColor="rgba(0, 0, 0, 0.05)"
                        pannable
                        zoomable
                    />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    )
}

export default UnifiedFlow
