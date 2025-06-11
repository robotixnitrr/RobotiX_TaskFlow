import { Handle, Position } from 'reactflow';

function TaskNode({ data }: { data: { label: string } }) {
    return (
        <div style={{ padding: 10, border: '1px solid #000', borderRadius: 3 }}>
            <Handle type="target" position={Position.Top} /> {/* Incoming connections */}
            <div>{data.label}</div>
            <Handle type="source" position={Position.Bottom} /> {/* Outgoing connections */}
        </div>
    );
}

export default TaskNode;
