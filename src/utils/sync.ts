import { AppDispatch, useAppDispatch } from "@/store/store";
import WebSocketManager from "./websocket";
import { fetchLabels } from "@/store/labelsSlice";
import { fetchTasks, initGroups } from "@/store/tasksSlice";
import { fetchTokens } from "@/store/tokensSlice";
import { fetchUser } from "@/store/userSlice";

const dispatch: AppDispatch = useAppDispatch();

export class SyncManager {
    private static instance: SyncManager | null = null;
    private ws = WebSocketManager.getInstance();
    private syncing = true

    private SyncManager() {
        this.registerEvents()
    }

    static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager()
        }
        return SyncManager.instance
    }

    public startSync(): void {
        if (this.syncing) {
            return
        }

        this.syncing = true
        this.ws.connect()

        dispatch(fetchUser())
        dispatch(fetchLabels())
        dispatch(fetchTasks())
        dispatch(fetchTokens())
        dispatch(initGroups())
    }

    private registerEvents(): void {
        // TODO: Watch out for duplicates

        this.ws.on('notification_settings_updated', this.onNotificationSettingsUpdatedWS);
        
        this.ws.on('label_created', this.onLabelCreatedWS);
        this.ws.on('label_updated', this.onLabelUpdatedWS);
        this.ws.on('label_deleted', this.onLabelDeletedWS);

        this.ws.on('task_created', this.onTaskCreatedWS);
        this.ws.on('task_updated', this.onTaskUpdatedWS);
        this.ws.on('task_deleted', this.onTaskDeletedWS);
        this.ws.on('task_completed', this.onTaskCompletedWS);
        this.ws.on('task_uncompleted', this.onTaskUncompletedWS);
        this.ws.on('task_skipped', this.onTaskSkippedWS);

        this.ws.on('app_token_created', this.onTokenCreatedWS);
        this.ws.on('app_token_deleted', this.onTokenDeletedWS);
    }
}
